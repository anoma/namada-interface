//! Structs for core MASP primitives.

use crate::keys::prf_expand;
use crate::pedersen_hash::{pedersen_hash, Personalization};
use crate::{asset_type::AssetType, constants};
use blake2s_simd::Params as Blake2sParams;
use borsh::maybestd::io::Error;
use borsh::maybestd::io::ErrorKind;
use borsh::maybestd::io::Write;
use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use byteorder::{LittleEndian, WriteBytesExt};
use ff::PrimeField;
use group::{cofactor::CofactorGroup, Curve, Group, GroupEncoding};
use rand_core::{CryptoRng, RngCore};
use std::cmp::Ordering;
use std::convert::TryInto;
use std::fmt::Display;
use std::fmt::Formatter;
use std::hash::Hash;
use std::hash::Hasher;
use std::str::FromStr;
use zcash_primitives::sapling::{group_hash::group_hash, Nullifier, Rseed};

#[derive(Clone, Debug)]
pub struct ValueCommitment {
    pub asset_generator: jubjub::ExtendedPoint,
    pub value: u64,
    pub randomness: jubjub::Fr,
}

impl ValueCommitment {
    pub fn commitment(&self) -> jubjub::SubgroupPoint {
        (CofactorGroup::clear_cofactor(&self.asset_generator) * jubjub::Fr::from(self.value))
            + (constants::VALUE_COMMITMENT_RANDOMNESS_GENERATOR * self.randomness)
    }
}

#[derive(Clone, Debug)]
pub struct ProofGenerationKey {
    pub ak: jubjub::SubgroupPoint,
    pub nsk: jubjub::Fr,
}

impl ProofGenerationKey {
    pub fn to_viewing_key(&self) -> ViewingKey {
        ViewingKey {
            ak: self.ak,
            nk: constants::PROOF_GENERATION_KEY_GENERATOR * self.nsk,
        }
    }
}

#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub struct ViewingKey {
    pub ak: jubjub::SubgroupPoint,
    pub nk: jubjub::SubgroupPoint,
}

impl Hash for ViewingKey {
    fn hash<H>(&self, state: &mut H)
    where
        H: Hasher,
    {
        self.ak.to_bytes().hash(state);
        self.nk.to_bytes().hash(state);
    }
}

impl ViewingKey {
    pub fn rk(&self, ar: jubjub::Fr) -> jubjub::SubgroupPoint {
        self.ak + constants::SPENDING_KEY_GENERATOR * ar
    }

    pub fn ivk(&self) -> SaplingIvk {
        let mut h = [0; 32];
        h.copy_from_slice(
            Blake2sParams::new()
                .hash_length(32)
                .personal(constants::CRH_IVK_PERSONALIZATION)
                .to_state()
                .update(&self.ak.to_bytes())
                .update(&self.nk.to_bytes())
                .finalize()
                .as_bytes(),
        );

        // Drop the most significant five bits, so it can be interpreted as a scalar.
        h[31] &= 0b0000_0111;

        SaplingIvk(jubjub::Fr::from_repr(h).unwrap())
    }
    pub fn to_payment_address(&self, diversifier: Diversifier) -> Option<PaymentAddress> {
        self.ivk().to_payment_address(diversifier)
    }
}

#[derive(Debug, Clone)]
pub struct SaplingIvk(pub jubjub::Fr);

impl SaplingIvk {
    pub fn to_payment_address(&self, diversifier: Diversifier) -> Option<PaymentAddress> {
        diversifier.g_d().and_then(|g_d| {
            let pk_d = g_d * self.0;

            PaymentAddress::from_parts(diversifier, pk_d)
        })
    }

    pub fn to_repr(&self) -> [u8; 32] {
        self.0.to_repr()
    }
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, Hash)]
pub struct Diversifier(pub [u8; 11]);

impl Diversifier {
    pub fn g_d(&self) -> Option<jubjub::SubgroupPoint> {
        group_hash(&self.0, constants::KEY_DIVERSIFICATION_PERSONALIZATION)
    }
}

/// A Sapling payment address.
///
/// # Invariants
///
/// `pk_d` is guaranteed to be prime-order (i.e. in the prime-order subgroup of Jubjub,
/// and not the identity).
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct PaymentAddress {
    pk_d: jubjub::SubgroupPoint,
    diversifier: Diversifier,
}

impl PaymentAddress {
    /// Constructs a PaymentAddress from a diversifier and a Jubjub point.
    ///
    /// Returns None if `pk_d` is the identity.
    pub fn from_parts(diversifier: Diversifier, pk_d: jubjub::SubgroupPoint) -> Option<Self> {
        if pk_d.is_identity().into() {
            None
        } else {
            Some(PaymentAddress { pk_d, diversifier })
        }
    }

    /// Constructs a PaymentAddress from a diversifier and a Jubjub point.
    ///
    /// Only for test code, as this explicitly bypasses the invariant.
    #[cfg(test)]
    #[allow(dead_code)]
    pub(crate) fn from_parts_unchecked(
        diversifier: Diversifier,
        pk_d: jubjub::SubgroupPoint,
    ) -> Self {
        PaymentAddress { pk_d, diversifier }
    }

    /// Parses a PaymentAddress from bytes.
    pub fn from_bytes(bytes: &[u8; 43]) -> Option<Self> {
        let diversifier = {
            let mut tmp = [0; 11];
            tmp.copy_from_slice(&bytes[0..11]);
            Diversifier(tmp)
        };
        // Check that the diversifier is valid
        diversifier.g_d()?;

        let pk_d = jubjub::SubgroupPoint::from_bytes(bytes[11..43].try_into().unwrap());
        if pk_d.is_some().into() {
            PaymentAddress::from_parts(diversifier, pk_d.unwrap())
        } else {
            None
        }
    }

    /// Returns the byte encoding of this `PaymentAddress`.
    pub fn to_bytes(&self) -> [u8; 43] {
        let mut bytes = [0; 43];
        bytes[0..11].copy_from_slice(&self.diversifier.0);
        bytes[11..].copy_from_slice(&self.pk_d.to_bytes());
        bytes
    }

    /// Returns the [`Diversifier`] for this `PaymentAddress`.
    pub fn diversifier(&self) -> &Diversifier {
        &self.diversifier
    }

    /// Returns `pk_d` for this `PaymentAddress`.
    pub fn pk_d(&self) -> &jubjub::SubgroupPoint {
        &self.pk_d
    }

    pub fn g_d(&self) -> Option<jubjub::SubgroupPoint> {
        self.diversifier.g_d()
    }

    pub fn create_note(
        &self,
        asset_type: AssetType,
        value: u64,
        randomness: Rseed,
    ) -> Option<Note> {
        self.g_d().map(|g_d| Note {
            asset_type,
            value,
            rseed: randomness,
            g_d,
            pk_d: self.pk_d,
        })
    }
}

impl Display for PaymentAddress {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result<(), std::fmt::Error> {
        write!(f, "{}", hex::encode(&self.to_bytes()))
    }
}

// impl FromStr for PaymentAddress {
//     type Err = Error;

//     fn from_str(s: &str) -> Result<Self, Self::Err> {
//         let vec = hex::decode(s).map_err(|x| Error::new(ErrorKind::InvalidData, x))?;
//         BorshDeserialize::try_from_slice(&vec)
//     }
// }

use bech32::{FromBase32, ToBase32, Variant};
use thiserror::Error;
const PAYMENT_ADDRESS_HRP: &str = "patest";
const BECH32M_VARIANT: bech32::Variant = Variant::Bech32m;

#[allow(missing_docs)]
#[derive(Error, Debug)]
pub enum DecodeError {
    #[error("Error decoding address from Bech32m: {0}")]
    DecodeBech32(bech32::Error),
    #[error("Error decoding address from base32: {0}")]
    DecodeBase32(bech32::Error),
    #[error("Unexpected Bech32m human-readable part {0}, expected {1}")]
    UnexpectedBech32Prefix(String, String),
    #[error("Unexpected Bech32m variant {0:?}, expected {BECH32M_VARIANT:?}")]
    UnexpectedBech32Variant(bech32::Variant),
    #[error("Invalid address encoding")]
    InvalidInnerEncoding(std::io::Error),
}

impl FromStr for PaymentAddress {
    type Err = DecodeError;

    fn from_str(string: &str) -> Result<Self, Self::Err> {
        let (prefix, base32, variant) =
            bech32::decode(string).map_err(DecodeError::DecodeBech32)?;
        if prefix != PAYMENT_ADDRESS_HRP {
            return Err(DecodeError::UnexpectedBech32Prefix(
                prefix,
                PAYMENT_ADDRESS_HRP.into(),
            ));
        }
        match variant {
            BECH32M_VARIANT => {}
            _ => return Err(DecodeError::UnexpectedBech32Variant(variant)),
        }
        let addr_len_err = |_| {
            DecodeError::InvalidInnerEncoding(Error::new(
                ErrorKind::InvalidData,
                "expected 43 bytes for the payment address",
            ))
        };
        let addr_data_err = || {
            DecodeError::InvalidInnerEncoding(Error::new(
                ErrorKind::InvalidData,
                "invalid payment address provided",
            ))
        };
        let bytes: Vec<u8> = FromBase32::from_base32(&base32).map_err(DecodeError::DecodeBase32)?;
        PaymentAddress::from_bytes(&bytes.try_into().map_err(addr_len_err)?)
            .ok_or_else(addr_data_err)
            .map(|x| x)
    }
}

impl PartialOrd for PaymentAddress {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        self.to_bytes().partial_cmp(&other.to_bytes())
    }
}

impl Ord for PaymentAddress {
    fn cmp(&self, other: &Self) -> Ordering {
        self.to_bytes().cmp(&other.to_bytes())
    }
}

impl Hash for PaymentAddress {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.to_bytes().hash(state)
    }
}

impl BorshSerialize for PaymentAddress {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        writer.write(self.to_bytes().as_ref()).and(Ok(()))
    }
}

impl BorshDeserialize for PaymentAddress {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        let data = buf.get(..43).ok_or(Error::from(ErrorKind::UnexpectedEof))?;
        let res = Self::from_bytes(data.try_into().unwrap());
        let pa = res.ok_or(Error::from(ErrorKind::InvalidData))?;
        *buf = &buf[43..];
        Ok(pa)
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Note {
    /// The asset type that the note represents
    pub asset_type: AssetType,
    /// The value of the note
    pub value: u64,
    /// The diversified base of the address, GH(d)
    pub g_d: jubjub::SubgroupPoint,
    /// The public key of the address, g_d^ivk
    pub pk_d: jubjub::SubgroupPoint,
    /// rseed
    pub rseed: Rseed,
}

impl PartialEq for Note {
    fn eq(&self, other: &Self) -> bool {
        self.value == other.value
            && self.asset_type == other.asset_type
            && self.g_d == other.g_d
            && self.pk_d == other.pk_d
            && self.rcm() == other.rcm()
    }
}

impl Note {
    pub fn uncommitted() -> bls12_381::Scalar {
        // The smallest u-coordinate that is not on the curve
        // is one.
        bls12_381::Scalar::one()
    }

    /// Computes the note commitment, returning the full point.
    fn cm_full_point(&self) -> jubjub::SubgroupPoint {
        // Calculate the note contents, as bytes
        let mut note_contents = vec![];

        // Write the asset generator, cofactor not cleared
        note_contents.extend_from_slice(&self.asset_type.asset_generator().to_bytes());

        // Writing the value in little endian
        (&mut note_contents)
            .write_u64::<LittleEndian>(self.value)
            .unwrap();

        // Write g_d
        note_contents.extend_from_slice(&self.g_d.to_bytes());

        // Write pk_d
        note_contents.extend_from_slice(&self.pk_d.to_bytes());

        assert_eq!(note_contents.len(), 32 + 32 + 32 + 8);

        // Compute the Pedersen hash of the note contents
        let hash_of_contents = pedersen_hash(
            Personalization::NoteCommitment,
            note_contents
                .into_iter()
                .flat_map(|byte| (0..8).map(move |i| ((byte >> i) & 1) == 1)),
        );

        // Compute final commitment
        (constants::NOTE_COMMITMENT_RANDOMNESS_GENERATOR * self.rcm()) + hash_of_contents
    }

    /// Computes the nullifier given the viewing key and
    /// note position
    pub fn nf(&self, viewing_key: &ViewingKey, position: u64) -> Nullifier {
        // Compute rho = cm + position.G
        let rho = self.cm_full_point()
            + (constants::NULLIFIER_POSITION_GENERATOR * jubjub::Fr::from(position));

        // Compute nf = BLAKE2s(nk | rho)
        Nullifier::from_slice(
            Blake2sParams::new()
                .hash_length(32)
                .personal(constants::PRF_NF_PERSONALIZATION)
                .to_state()
                .update(&viewing_key.nk.to_bytes())
                .update(&rho.to_bytes())
                .finalize()
                .as_bytes(),
        )
        .unwrap()
    }

    /// Computes the note commitment
    pub fn cmu(&self) -> bls12_381::Scalar {
        // The commitment is in the prime order subgroup, so mapping the
        // commitment to the u-coordinate is an injective encoding.
        jubjub::ExtendedPoint::from(self.cm_full_point())
            .to_affine()
            .get_u()
    }

    pub fn rcm(&self) -> jubjub::Fr {
        match self.rseed {
            Rseed::BeforeZip212(rcm) => rcm,
            Rseed::AfterZip212(rseed) => {
                jubjub::Fr::from_bytes_wide(prf_expand(&rseed, &[0x04]).as_array())
            }
        }
    }

    pub fn generate_or_derive_esk<R: RngCore + CryptoRng>(&self, rng: &mut R) -> jubjub::Fr {
        match self.derive_esk() {
            None => {
                // create random 64 byte buffer
                let mut buffer = [0u8; 64];
                rng.fill_bytes(&mut buffer);

                // reduce to uniform value
                jubjub::Fr::from_bytes_wide(&buffer)
            }
            Some(esk) => esk,
        }
    }

    /// Returns the derived `esk` if this note was created after ZIP 212 activated.
    pub fn derive_esk(&self) -> Option<jubjub::Fr> {
        match self.rseed {
            Rseed::BeforeZip212(_) => None,
            Rseed::AfterZip212(rseed) => Some(jubjub::Fr::from_bytes_wide(
                prf_expand(&rseed, &[0x05]).as_array(),
            )),
        }
    }
}

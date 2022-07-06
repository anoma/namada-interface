//! Structs representing the components within Zcash transactions.

use borsh::maybestd::io::Error;
use borsh::maybestd::io::ErrorKind;
use borsh::{BorshDeserialize, BorshSerialize};
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use ff::PrimeField;
use group::GroupEncoding;
use serde::{Deserialize, Serialize};
use std::convert::TryInto;
use std::io::{self, Read, Write};
use std::hash::Hasher;
use std::hash::Hash;
use std::cmp::Ordering;
use crate::transaction::AssetType;

use crate::legacy::Script;
use crate::redjubjub::{PublicKey, Signature};
use crate::util::*;

pub mod amount;
pub use self::amount::Amount;

// π_A + π_B + π_C
pub const GROTH_PROOF_SIZE: usize = 48 + 96 + 48;
// π_A + π_A' + π_B + π_B' + π_C + π_C' + π_K + π_H
const PHGR_PROOF_SIZE: usize = 33 + 33 + 65 + 33 + 33 + 33 + 33 + 33;

const ZC_NUM_JS_INPUTS: usize = 2;
const ZC_NUM_JS_OUTPUTS: usize = 2;

#[derive(Clone, Debug, PartialEq, PartialOrd, Eq, Ord, Serialize, Deserialize, Hash)]
pub struct OutPoint {
    hash: [u8; 32],
    n: u32,
}

impl OutPoint {
    pub fn new(hash: [u8; 32], n: u32) -> Self {
        OutPoint { hash, n }
    }

    pub fn read<R: Read>(mut reader: R) -> io::Result<Self> {
        let mut hash = [0u8; 32];
        reader.read_exact(&mut hash)?;
        let n = reader.read_u32::<LittleEndian>()?;
        Ok(OutPoint { hash, n })
    }

    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        writer.write_all(&self.hash)?;
        writer.write_u32::<LittleEndian>(self.n)
    }

    pub fn n(&self) -> u32 {
        self.n
    }

    pub fn hash(&self) -> &[u8; 32] {
        &self.hash
    }
}

impl BorshDeserialize for OutPoint {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        Self::read(buf)
    }
}

impl BorshSerialize for OutPoint {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        self.write(writer)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd)]
pub struct TxIn {
    pub prevout: OutPoint,
    pub script_sig: Script,
    pub sequence: u32,
}

impl TxIn {
    #[cfg(feature = "transparent-inputs")]
    #[cfg_attr(docsrs, doc(cfg(feature = "transparent-inputs")))]
    pub fn new(prevout: OutPoint) -> Self {
        TxIn {
            prevout,
            script_sig: Script::default(),
            sequence: std::u32::MAX,
        }
    }

    pub fn read<R: Read>(mut reader: &mut R) -> io::Result<Self> {
        let prevout = OutPoint::read(&mut reader)?;
        let script_sig = Script::read(&mut reader)?;
        let sequence = reader.read_u32::<LittleEndian>()?;

        Ok(TxIn {
            prevout,
            script_sig,
            sequence,
        })
    }

    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        self.prevout.write(&mut writer)?;
        self.script_sig.write(&mut writer)?;
        writer.write_u32::<LittleEndian>(self.sequence)
    }
}

impl BorshDeserialize for TxIn {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        Self::read(buf)
    }
}

impl BorshSerialize for TxIn {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        self.write(writer)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize, Hash, PartialOrd, PartialEq, Ord, Eq)]
pub struct TxOut {
    pub asset_type: AssetType,
    pub value: u64,
    pub script_pubkey: Script,
}

impl TxOut {
    pub fn read<R: Read>(mut reader: &mut R) -> io::Result<Self> {
        let asset_type = {
            let mut tmp = [0u8; 32];
            reader.read_exact(&mut tmp)?;
            AssetType::from_identifier(&tmp)
        }
        .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidData, "value out of range"))?;
        let value = {
            let mut tmp = [0u8; 8];
            reader.read_exact(&mut tmp)?;
            u64::from_le_bytes(tmp)
        };
        let script_pubkey = Script::read(&mut reader)?;

        Ok(TxOut {
            asset_type,
            value,
            script_pubkey,
        })
    }

    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        writer.write_all(self.asset_type.get_identifier())?;
        writer.write_all(&self.value.to_le_bytes())?;
        self.script_pubkey.write(&mut writer)
    }
}

impl BorshDeserialize for TxOut {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        Self::read(buf)
    }
}

impl BorshSerialize for TxOut {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        self.write(writer)
    }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct SpendDescription {
    #[serde(serialize_with = "sserialize_extended_point")]
    #[serde(deserialize_with = "sdeserialize_extended_point")]
    pub cv: jubjub::ExtendedPoint,
    #[serde(serialize_with = "sserialize_scalar")]
    #[serde(deserialize_with = "sdeserialize_scalar")]
    pub anchor: bls12_381::Scalar,
    pub nullifier: [u8; 32],
    pub rk: PublicKey,
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    pub zkproof: [u8; GROTH_PROOF_SIZE],
    pub spend_auth_sig: Option<Signature>,
}

impl PartialOrd for SpendDescription {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        (self.cv.to_bytes(), self.anchor.to_bytes(), self.nullifier, self.rk, self.zkproof, self.spend_auth_sig).partial_cmp(&(other.cv.to_bytes(), other.anchor.to_bytes(), other.nullifier, other.rk, other.zkproof, other.spend_auth_sig))
    }
}

impl Hash for SpendDescription {
    fn hash<H>(&self, state: &mut H) where H: Hasher {
        self.cv.to_bytes().hash(state);
        self.anchor.to_bytes().hash(state);
        self.nullifier.hash(state);
        self.rk.hash(state);
        self.zkproof.hash(state);
        self.spend_auth_sig.hash(state);
    }
}

impl std::fmt::Debug for SpendDescription {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "SpendDescription(cv = {:?}, anchor = {:?}, nullifier = {:?}, rk = {:?}, spend_auth_sig = {:?})",
            self.cv, self.anchor, self.nullifier, self.rk, self.spend_auth_sig
        )
    }
}

impl BorshDeserialize for SpendDescription {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        Self::read(buf)
    }
}

impl BorshSerialize for SpendDescription {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        self.write(writer)
    }
}

impl SpendDescription {
    pub fn read<R: Read>(mut reader: &mut R) -> io::Result<Self> {
        // Consensus rules (§4.4):
        // - Canonical encoding is enforced here.
        // - "Not small order" is enforced in SaplingVerificationContext::check_spend()
        //   (located in zcash_proofs::sapling::verifier).
        let cv = {
            let mut bytes = [0u8; 32];
            reader.read_exact(&mut bytes)?;
            let cv = jubjub::ExtendedPoint::from_bytes(&bytes);
            if cv.is_none().into() {
                return Err(io::Error::new(io::ErrorKind::InvalidInput, "invalid cv"));
            }
            cv.unwrap()
        };

        // Consensus rule (§7.3): Canonical encoding is enforced here
        let anchor = {
            let mut f = [0u8; 32];
            reader.read_exact(&mut f)?;
            Option::from(bls12_381::Scalar::from_repr(f))
                .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "anchor not in field"))?
        };

        let mut nullifier = [0u8; 32];
        reader.read_exact(&mut nullifier)?;

        // Consensus rules (§4.4):
        // - Canonical encoding is enforced here.
        // - "Not small order" is enforced in SaplingVerificationContext::check_spend()
        let rk = PublicKey::read(&mut reader)?;

        // Consensus rules (§4.4):
        // - Canonical encoding is enforced by the API of SaplingVerificationContext::check_spend()
        //   due to the need to parse this into a bellman::groth16::Proof.
        // - Proof validity is enforced in SaplingVerificationContext::check_spend()
        let mut zkproof = [0u8; GROTH_PROOF_SIZE];
        reader.read_exact(&mut zkproof)?;

        // Consensus rules (§4.4):
        // - Canonical encoding is enforced here.
        // - Signature validity is enforced in SaplingVerificationContext::check_spend()
        let spend_auth_sig = Some(Signature::read(&mut reader)?);

        Ok(SpendDescription {
            cv,
            anchor,
            nullifier,
            rk,
            zkproof,
            spend_auth_sig,
        })
    }

    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        writer.write_all(&self.cv.to_bytes())?;
        writer.write_all(self.anchor.to_repr().as_ref())?;
        writer.write_all(&self.nullifier)?;
        self.rk.write(&mut writer)?;
        writer.write_all(&self.zkproof)?;
        match self.spend_auth_sig {
            Some(sig) => sig.write(&mut writer),
            None => Err(io::Error::new(
                io::ErrorKind::InvalidInput,
                "Missing spend auth signature",
            )),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct OutputDescription {
    #[serde(serialize_with = "sserialize_extended_point")]
    #[serde(deserialize_with = "sdeserialize_extended_point")]
    pub cv: jubjub::ExtendedPoint,
    #[serde(serialize_with = "sserialize_scalar")]
    #[serde(deserialize_with = "sdeserialize_scalar")]
    pub cmu: bls12_381::Scalar,
    #[serde(serialize_with = "sserialize_extended_point")]
    #[serde(deserialize_with = "sdeserialize_extended_point")]
    pub ephemeral_key: jubjub::ExtendedPoint,
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, 612>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, 612>")]
    pub enc_ciphertext: [u8; 612],
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, 80>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, 80>")]
    pub out_ciphertext: [u8; 80],
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    pub zkproof: [u8; GROTH_PROOF_SIZE],
}

impl PartialOrd for OutputDescription {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        (self.cv.to_bytes(), self.cmu.to_bytes(), self.ephemeral_key.to_bytes(), self.enc_ciphertext, self.out_ciphertext, self.zkproof).partial_cmp(&(other.cv.to_bytes(), other.cmu.to_bytes(), other.ephemeral_key.to_bytes(), other.enc_ciphertext, other.out_ciphertext, other.zkproof))
    }
}

impl Hash for OutputDescription {
    fn hash<H>(&self, state: &mut H) where H: Hasher {
        self.cv.to_bytes().hash(state);
        self.cmu.to_bytes().hash(state);
        self.ephemeral_key.to_bytes().hash(state);
        self.enc_ciphertext.hash(state);
        self.out_ciphertext.hash(state);
        self.zkproof.hash(state);
    }
}

impl BorshDeserialize for OutputDescription {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        Self::read(buf)
    }
}

impl BorshSerialize for OutputDescription {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        self.write(writer)
    }
}

impl std::fmt::Debug for OutputDescription {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "OutputDescription(cv = {:?}, cmu = {:?}, ephemeral_key = {:?})",
            self.cv, self.cmu, self.ephemeral_key
        )
    }
}

impl OutputDescription {
    pub fn read<R: Read>(reader: &mut R) -> io::Result<Self> {
        // Consensus rules (§4.5):
        // - Canonical encoding is enforced here.
        // - "Not small order" is enforced in SaplingVerificationContext::check_output()
        //   (located in zcash_proofs::sapling::verifier).
        let cv = {
            let mut bytes = [0u8; 32];
            reader.read_exact(&mut bytes)?;
            let cv = jubjub::ExtendedPoint::from_bytes(&bytes);
            if cv.is_none().into() {
                return Err(io::Error::new(io::ErrorKind::InvalidInput, "invalid cv"));
            }
            cv.unwrap()
        };

        // Consensus rule (§7.4): Canonical encoding is enforced here
        let cmu = {
            let mut f = [0u8; 32];
            reader.read_exact(&mut f)?;
            Option::from(bls12_381::Scalar::from_repr(f))
                .ok_or_else(|| io::Error::new(io::ErrorKind::InvalidInput, "cmu not in field"))?
        };

        // Consensus rules (§4.5):
        // - Canonical encoding is enforced here.
        // - "Not small order" is enforced in SaplingVerificationContext::check_output()
        let ephemeral_key = {
            let mut bytes = [0u8; 32];
            reader.read_exact(&mut bytes)?;
            let ephemeral_key = jubjub::ExtendedPoint::from_bytes(&bytes);
            if ephemeral_key.is_none().into() {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidInput,
                    "invalid ephemeral_key",
                ));
            }
            ephemeral_key.unwrap()
        };

        let mut enc_ciphertext = [0u8; 612];
        let mut out_ciphertext = [0u8; 80];
        reader.read_exact(&mut enc_ciphertext)?;
        reader.read_exact(&mut out_ciphertext)?;

        // Consensus rules (§4.5):
        // - Canonical encoding is enforced by the API of SaplingVerificationContext::check_output()
        //   due to the need to parse this into a bellman::groth16::Proof.
        // - Proof validity is enforced in SaplingVerificationContext::check_output()
        let mut zkproof = [0u8; GROTH_PROOF_SIZE];
        reader.read_exact(&mut zkproof)?;

        Ok(OutputDescription {
            cv,
            cmu,
            ephemeral_key,
            enc_ciphertext,
            out_ciphertext,
            zkproof,
        })
    }

    pub fn write<W: Write>(&self, mut writer: W) -> io::Result<()> {
        writer.write_all(&self.cv.to_bytes())?;
        writer.write_all(self.cmu.to_repr().as_ref())?;
        writer.write_all(&self.ephemeral_key.to_bytes())?;
        writer.write_all(&self.enc_ciphertext)?;
        writer.write_all(&self.out_ciphertext)?;
        writer.write_all(&self.zkproof)
    }
}

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd)]
enum SproutProof {
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, GROTH_PROOF_SIZE>")]
    Groth([u8; GROTH_PROOF_SIZE]),
    #[serde(serialize_with = "sserialize_array::<_, u8, u8, PHGR_PROOF_SIZE>")]
    #[serde(deserialize_with = "sdeserialize_array::<_, u8, u8, PHGR_PROOF_SIZE>")]
    PHGR([u8; PHGR_PROOF_SIZE]),
}

impl BorshDeserialize for SproutProof {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        let tag = BorshDeserialize::deserialize(buf)?;
        match tag {
            0 => Ok(Self::Groth(deserialize_array(buf)?)),
            1 => Ok(Self::PHGR(deserialize_array(buf)?)),
            _ => Err(Error::from(ErrorKind::InvalidData)),
        }
    }
}

impl BorshSerialize for SproutProof {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        match self {
            Self::Groth(groth) => {
                BorshSerialize::serialize(&0u8, writer)?;
                writer.write(groth.as_ref())?;
            }
            Self::PHGR(phgr) => {
                BorshSerialize::serialize(&0u8, writer)?;
                writer.write(phgr.as_ref())?;
            }
        }
        Ok(())
    }
}

impl std::fmt::Debug for SproutProof {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        match self {
            SproutProof::Groth(_) => write!(f, "SproutProof::Groth"),
            SproutProof::PHGR(_) => write!(f, "SproutProof::PHGR"),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Hash, PartialEq, Eq, PartialOrd)]
pub struct JSDescription {
    asset_type: AssetType,
    vpub_old: u64,
    vpub_new: u64,
    anchor: [u8; 32],
    nullifiers: [[u8; 32]; ZC_NUM_JS_INPUTS],
    commitments: [[u8; 32]; ZC_NUM_JS_OUTPUTS],
    ephemeral_key: [u8; 32],
    random_seed: [u8; 32],
    macs: [[u8; 32]; ZC_NUM_JS_INPUTS],
    proof: SproutProof,
    #[serde(
        serialize_with = "sserialize_array::<_, SerdeArray<u8, 601>, [u8; 601], ZC_NUM_JS_OUTPUTS>"
    )]
    #[serde(
        deserialize_with = "sdeserialize_array::<_, SerdeArray<u8, 601>, [u8; 601], ZC_NUM_JS_OUTPUTS>"
    )]
    ciphertexts: [[u8; 601]; ZC_NUM_JS_OUTPUTS],
}

fn deserialize_array<const N: usize>(buf: &mut &[u8]) -> borsh::maybestd::io::Result<[u8; N]> {
    let errf = || Error::from(ErrorKind::UnexpectedEof);
    let data = buf.get(0..N).ok_or_else(errf)?.try_into().unwrap();
    *buf = &buf[N..];
    Ok(data)
}

impl BorshDeserialize for JSDescription {
    fn deserialize(buf: &mut &[u8]) -> borsh::maybestd::io::Result<Self> {
        let asset_type = BorshDeserialize::deserialize(buf)?;
        let vpub_old = BorshDeserialize::deserialize(buf)?;
        let vpub_new = BorshDeserialize::deserialize(buf)?;
        let anchor = BorshDeserialize::deserialize(buf)?;
        let nullifiers = BorshDeserialize::deserialize(buf)?;
        let commitments = BorshDeserialize::deserialize(buf)?;
        let ephemeral_key = BorshDeserialize::deserialize(buf)?;
        let random_seed = BorshDeserialize::deserialize(buf)?;
        let macs = BorshDeserialize::deserialize(buf)?;
        let proof = BorshDeserialize::deserialize(buf)?;
        let mut ciphertexts = Vec::new();
        for i in 0..ZC_NUM_JS_OUTPUTS {
            ciphertexts.push(deserialize_array(buf)?);
        }
        let ciphertexts = ciphertexts.try_into().unwrap();
        Ok(Self {
            asset_type,
            vpub_old,
            vpub_new,
            anchor,
            nullifiers,
            commitments,
            ephemeral_key,
            random_seed,
            macs,
            proof,
            ciphertexts,
        })
    }
}

impl BorshSerialize for JSDescription {
    fn serialize<W: Write>(&self, writer: &mut W) -> borsh::maybestd::io::Result<()> {
        BorshSerialize::serialize(&self.asset_type, writer)?;
        BorshSerialize::serialize(&self.vpub_old, writer)?;
        BorshSerialize::serialize(&self.vpub_new, writer)?;
        BorshSerialize::serialize(&self.anchor, writer)?;
        BorshSerialize::serialize(&self.nullifiers, writer)?;
        BorshSerialize::serialize(&self.commitments, writer)?;
        BorshSerialize::serialize(&self.ephemeral_key, writer)?;
        BorshSerialize::serialize(&self.random_seed, writer)?;
        BorshSerialize::serialize(&self.macs, writer)?;
        BorshSerialize::serialize(&self.proof, writer)?;
        for ct in &self.ciphertexts {
            writer.write(ct.as_ref())?;
        }
        Ok(())
    }
}

impl std::fmt::Debug for JSDescription {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "JSDescription(
                vpub_old = {:?}, vpub_new = {:?},
                anchor = {:?},
                nullifiers = {:?},
                commitments = {:?},
                ephemeral_key = {:?},
                random_seed = {:?},
                macs = {:?})",
            self.vpub_old,
            self.vpub_new,
            self.anchor,
            self.nullifiers,
            self.commitments,
            self.ephemeral_key,
            self.random_seed,
            self.macs
        )
    }
}

impl JSDescription {
    pub fn read<R: Read>(reader: &mut R, use_groth: bool) -> io::Result<Self> {
        let asset_type = {
            let mut tmp = [0u8; 32];
            reader.read_exact(&mut tmp)?;
            AssetType::from_identifier(&tmp)
        }.ok_or_else(|| std::io::Error::new(std::io::ErrorKind::InvalidData, "invalid asset type"))?;
        // Consensus rule (§4.3): Canonical encoding is enforced here
        let vpub_old = {
            let mut tmp = [0u8; 8];
            reader.read_exact(&mut tmp)?;
            u64::from_le_bytes(tmp)
        };

        // Consensus rule (§4.3): Canonical encoding is enforced here
        let vpub_new = {
            let mut tmp = [0u8; 8];
            reader.read_exact(&mut tmp)?;
            u64::from_le_bytes(tmp)
        };

        // Consensus rule (§4.3): One of vpub_old and vpub_new being zero is
        // enforced by CheckTransactionWithoutProofVerification() in zcashd.

        let mut anchor = [0u8; 32];
        reader.read_exact(&mut anchor)?;

        let mut nullifiers = [[0u8; 32]; ZC_NUM_JS_INPUTS];
        nullifiers
            .iter_mut()
            .map(|nf| reader.read_exact(nf))
            .collect::<io::Result<()>>()?;

        let mut commitments = [[0u8; 32]; ZC_NUM_JS_OUTPUTS];
        commitments
            .iter_mut()
            .map(|cm| reader.read_exact(cm))
            .collect::<io::Result<()>>()?;

        // Consensus rule (§4.3): Canonical encoding is enforced by
        // ZCNoteDecryption::decrypt() in zcashd
        let mut ephemeral_key = [0u8; 32];
        reader.read_exact(&mut ephemeral_key)?;

        let mut random_seed = [0u8; 32];
        reader.read_exact(&mut random_seed)?;

        let mut macs = [[0u8; 32]; ZC_NUM_JS_INPUTS];
        macs.iter_mut()
            .map(|mac| reader.read_exact(mac))
            .collect::<io::Result<()>>()?;

        let proof = if use_groth {
            // Consensus rules (§4.3):
            // - Canonical encoding is enforced in librustzcash_sprout_verify()
            // - Proof validity is enforced in librustzcash_sprout_verify()
            let mut proof = [0u8; GROTH_PROOF_SIZE];
            reader.read_exact(&mut proof)?;
            SproutProof::Groth(proof)
        } else {
            // Consensus rules (§4.3):
            // - Canonical encoding is enforced by PHGRProof in zcashd
            // - Proof validity is enforced by JSDescription::Verify() in zcashd
            let mut proof = [0u8; PHGR_PROOF_SIZE];
            reader.read_exact(&mut proof)?;
            SproutProof::PHGR(proof)
        };

        let mut ciphertexts = [[0u8; 601]; ZC_NUM_JS_OUTPUTS];
        ciphertexts
            .iter_mut()
            .map(|ct| reader.read_exact(ct))
            .collect::<io::Result<()>>()?;

        Ok(JSDescription {
            asset_type,
            vpub_old,
            vpub_new,
            anchor,
            nullifiers,
            commitments,
            ephemeral_key,
            random_seed,
            macs,
            proof,
            ciphertexts,
        })
    }

    pub fn write<W: Write>(&self, writer: &mut W) -> io::Result<()> {
        writer.write_all(self.asset_type.get_identifier())?;
        writer.write_all(&self.vpub_old.to_le_bytes())?;
        writer.write_all(&self.vpub_new.to_le_bytes())?;
        writer.write_all(&self.anchor)?;
        writer.write_all(&self.nullifiers[0])?;
        writer.write_all(&self.nullifiers[1])?;
        writer.write_all(&self.commitments[0])?;
        writer.write_all(&self.commitments[1])?;
        writer.write_all(&self.ephemeral_key)?;
        writer.write_all(&self.random_seed)?;
        writer.write_all(&self.macs[0])?;
        writer.write_all(&self.macs[1])?;

        match &self.proof {
            SproutProof::Groth(p) => writer.write_all(p)?,
            SproutProof::PHGR(p) => writer.write_all(p)?,
        }

        writer.write_all(&self.ciphertexts[0])?;
        writer.write_all(&self.ciphertexts[1])
    }
}

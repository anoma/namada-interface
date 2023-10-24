//! ShieldedHDWallet - Provide wasm_bindgen bindings for zip32 HD wallets
//! Imports from masp_primitives::zip32, instead of zcash_primitives::zip32, as
//! the value for constant ZIP32_SAPLING_MASTER_PERSONALIZATION is different!
//! Otherwise, these implementations should be equivalent.
use crate::crypto::pointer_types::VecU8Pointer;
use masp_primitives::zip32::{ChildIndex, ExtendedFullViewingKey, ExtendedSpendingKey};
use thiserror::Error;
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

const SEED_SIZE: usize = 64;

#[derive(Debug, Error)]
pub enum Zip32Error {
    #[error("Invalid key size! Expected 96")]
    InvalidKeySize,
    #[error("Invalid diversifier index size! Expected 11")]
    InvalidSeedSize,
    #[error("Could not derive child key!")]
    ChildDerivationError,
    #[error("BorshSerialize failed!")]
    BorshSerialize,
}

#[wasm_bindgen]
pub struct ExtSpendingKey(pub(crate) ExtendedSpendingKey);

#[wasm_bindgen]
pub struct ExtFullViewingKey(pub(crate) ExtendedFullViewingKey);

#[wasm_bindgen]
pub struct ExtendedKeys {
    xsk: ExtSpendingKey,
    xfvk: ExtFullViewingKey,
}

#[wasm_bindgen]
impl ExtendedKeys {
    pub fn xsk(self) -> ExtSpendingKey {
        self.xsk
    }

    pub fn xfvk(self) -> ExtFullViewingKey {
        self.xfvk
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct Serialized {
    payment_address: Vec<u8>,
    xsk: Vec<u8>,
    xfvk: Vec<u8>,
}

#[wasm_bindgen]
impl Serialized {
    pub fn payment_address(&self) -> Vec<u8> {
        self.payment_address.clone()
    }

    pub fn xsk(&self) -> Vec<u8> {
        self.xsk.clone()
    }

    pub fn xfvk(&self) -> Vec<u8> {
        self.xfvk.clone()
    }
}

#[wasm_bindgen]
pub struct ShieldedHDWallet {
    xsk_m: ExtendedSpendingKey,
    xfvk_m: ExtendedFullViewingKey,
}

#[wasm_bindgen]
impl ShieldedHDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: VecU8Pointer) -> Result<ShieldedHDWallet, String> {
        // zip-0032 requires seed to be at least 32 and at most 252 bytes,
        // but the seed generated from our mnemonic will be 64, so let's
        // enforce it here:
        let mut seed: [u8; SEED_SIZE] = match seed.vec.clone().try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(format!("{}: {:?}", Zip32Error::InvalidSeedSize, err)),
        };

        let xsk_m = ExtendedSpendingKey::master(&seed);
        seed.zeroize();
        let xfvk_m = ExtendedFullViewingKey::from(&xsk_m);

        Ok(ShieldedHDWallet { xsk_m, xfvk_m })
    }

    pub fn derive_to_serialized_keys(&self, index: u32) -> Result<Serialized, String> {
        let c_index = ChildIndex::NonHardened(index);
        let child_sk = self.xsk_m.derive_child(c_index);
        let child_fvk = self
            .xfvk_m
            .derive_child(c_index)
            .map_err(|err| format!("{}: {:?}", Zip32Error::ChildDerivationError, err))?;

        let (_, address) = child_sk.default_address();

        // BorshSerialize the payment address and keys for resulting children
        let payment_address = borsh::to_vec(&address)
            .map_err(|err| format!("{}: {:?}", Zip32Error::BorshSerialize, err))?;
        let child_sk = borsh::to_vec(&child_sk)
            .map_err(|err| format!("{}: {:?}", Zip32Error::BorshSerialize, err))?;
        let child_fvk = borsh::to_vec(&child_fvk)
            .map_err(|err| format!("{}: {:?}", Zip32Error::BorshSerialize, err))?;

        Ok(Serialized {
            payment_address,
            xsk: child_sk,
            xfvk: child_fvk,
        })
    }

    // TODO
    //
    // Implement derive child from path:
    //
    // Key Path Levels:  https://zips.z.cash/zip-0032#key-path-levels
    // Sapling Key Path: https://zips.z.cash/zip-0032#sapling-key-path
    // Orchard Key Path: https://zips.z.cash/zip-0032#orchard-key-path
    //
    // (NOTE: masp_primitives uses Sapling)
    //
    // m/32'/1'/0' - m/32'/1'/0'/0
    //
    // Where:
    //
    // 32' -> Purpose (Bip43 rec)
    // 1' -> Coin Type (1 = tesnet all coins)
    // 0' -> Account
    // 0 -> Child index
    //
    // Currently, we only specify a ChildIndex, but should be able to specify
    // both Coin-Type and Account.
}

#[cfg(test)]
mod tests {
    use super::*;
    use masp_primitives::primitives::PaymentAddress;

    const KEY_SIZE: usize = 96;

    #[test]
    #[should_panic]
    fn invalid_seed_should_panic() {
        let _zip32 = ShieldedHDWallet::new(VecU8Pointer::new(vec![0, 1, 2, 3, 4])).unwrap();
    }

    #[test]
    fn can_instantiate_from_seed() {
        let seed: &[u8] = &[0; 64];
        let shielded_wallet = ShieldedHDWallet::new(VecU8Pointer::new(Vec::from(seed)));

        assert!(shielded_wallet.is_ok());
    }

    #[test]
    fn can_derive_child_to_serialized() {
        let seed: &[u8] = &[0; SEED_SIZE];
        let shielded_wallet = ShieldedHDWallet::new(VecU8Pointer::new(Vec::from(seed)))
            .expect("Instantiating ShieldedHDWallet should not fail");

        let Serialized {
            ref payment_address,
            ref xsk,
            ref xfvk,
        } = shielded_wallet
            .derive_to_serialized_keys(1)
            .expect("Deriving from ExtendedKeys should not fail");

        let payment_address: PaymentAddress =
            borsh::BorshDeserialize::try_from_slice(&payment_address)
                .expect("Should be able to deserialize payment address!");
        let xsk: ExtendedSpendingKey = borsh::BorshDeserialize::try_from_slice(&xsk)
            .expect("Should be able to deserialize extended spending key!");
        let xfvk: ExtendedFullViewingKey = borsh::BorshDeserialize::try_from_slice(&xfvk)
            .expect("Should be able to deserialize full viewing key!");

        assert_eq!(payment_address.to_bytes().len(), 43);
        assert_eq!(xsk.expsk.to_bytes().len(), KEY_SIZE);
        assert_eq!(xfvk.fvk.to_bytes().len(), KEY_SIZE);
    }
}

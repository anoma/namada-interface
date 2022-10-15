//! ShieldedHDWallet - Provide wasm_bindgen bindings for zcash_primitives::zip32 HD wallets
//! TODO: We may want to instead import from masp_primitives::zip32, as
//! the value for constant ZIP32_SAPLING_MASTER_PERSONALIZATION is different!
//! Otherwise, these implementations appear to be equivalent.
use zcash_primitives::zip32::{
    ChildIndex,
    ExtendedSpendingKey,
    ExtendedFullViewingKey,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Error)]
pub enum Zip32Error {
    #[error("Invalid seed length")]
    InvalidSeedSize,
}

#[wasm_bindgen]
pub struct ExtendedKeys {
    xsk: Vec<u8>,
    xfvk: Vec<u8>,
}

#[wasm_bindgen]
impl ExtendedKeys {
    pub fn xsk(&self) -> Vec<u8> {
        self.xsk.clone()
    }

    pub fn xfvk(&self) -> Vec<u8> {
        self.xfvk.clone()
    }
}

#[wasm_bindgen]
pub struct ExtSpendingKey(pub (crate) ExtendedSpendingKey);

#[wasm_bindgen]
pub struct ExtFullViewingKey(pub (crate) ExtendedFullViewingKey);

#[wasm_bindgen]
pub struct ShieldedHDWallet {
    seed: [u8; 64],
    xsk_m: ExtendedSpendingKey,
    xfvk_m: ExtendedFullViewingKey,
}

#[wasm_bindgen]
impl ShieldedHDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: Vec<u8>) -> Result<ShieldedHDWallet, String> {
        // Seed must be 64 bytes to match Mnemonic
        let seed: [u8; 64] = match seed.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(format!("{}: {:?}", Zip32Error::InvalidSeedSize, err)),
        };

        let xsk_m = ExtendedSpendingKey::master(&seed);
        let xfvk_m = ExtendedFullViewingKey::from(&xsk_m);

        Ok(ShieldedHDWallet {
            seed,
            xsk_m,
            xfvk_m,
        })
    }

    pub fn default_address(&self) -> Vec<u8> {
        let (_, address) = self.xsk_m.default_address();
        let bytes: &[u8] = &address.to_bytes();
        Vec::from(bytes)
    }

    pub fn derive_child(&self, index: u32) -> Result<ExtendedKeys, String> {
        let index = ChildIndex::NonHardened(index);
        let child_sk = self.xsk_m.derive_child(index);
        let child_fvk = self.xfvk_m.derive_child(index)
            .map_err(|_| String::from("Could not derive child full viewing key"))?;

        let (_, xsk_address) = child_sk.default_address();
        let xsk: &[u8] = &xsk_address.to_bytes();

        let (_, xfvk_address) = child_fvk.default_address();
        let xfvk: &[u8] = &xfvk_address.to_bytes();

        Ok(ExtendedKeys {
            xsk: Vec::from(xsk),
            xfvk: Vec::from(xfvk),
        })
    }

    pub fn seed(&self) -> Vec<u8> {
        let seed: &[u8] = &self.seed;
        Vec::from(seed)
    }

    pub fn extended_keys(&self) -> ExtendedKeys {
        let (_, xsk) = &self.xsk_m.default_address();
        let (_, xfvk) = &self.xfvk_m.default_address();

        let xsk_bytes: &[u8] = &xsk.to_bytes();
        let xfvk_bytes: &[u8] = &xfvk.to_bytes();

        ExtendedKeys {
            xsk: Vec::from(xsk_bytes),
            xfvk: Vec::from(xfvk_bytes),
        }
    }

    pub fn xsk_master(&self) -> ExtSpendingKey {
        ExtSpendingKey(self.xsk_m.clone())
    }

    pub fn xfvk_master(&self) -> ExtFullViewingKey {
        ExtFullViewingKey(self.xfvk_m.clone())
    }

    // TODO - Implement for:
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
    // Generate Spending Key
    // Generate Viewing Key
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_instantiate_from_seed() {
        let seed: &[u8] = &[0; 64];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed));

        assert!(shielded_wallet.is_ok());

        let shielded_wallet = shielded_wallet.unwrap();
        let address = shielded_wallet.default_address();

        let expected: &[u8] = &[253, 245, 255, 224, 122, 231, 20, 4, 103, 209, 36, 54, 100, 101, 140,
                                159, 130, 83, 20, 74, 132, 241, 199, 122, 9, 104, 22, 110, 81, 117, 127,
                                178, 212, 7, 209, 157, 251, 100, 242, 229, 135, 218, 175];

        assert_eq!(address, Vec::from(expected));
    }

    #[test]
    fn can_derive_child_keys() {
        let seed: &[u8] = &[0; 64];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed))
            .expect("Should be able to instantiate ShieldedHDWallet");

        let ExtendedKeys { xsk, xfvk } = shielded_wallet.derive_child(1)
            .expect("Should derive child extended keys!");

        assert_eq!(xsk, xfvk);
    }

    #[test]
    fn can_recover_native_spending_key() {
        let seed: &[u8] = &[0; 64];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed))
            .expect("Should be able to instantiate ShieldedHDWallet");
        let xsk_m = shielded_wallet.xsk_master();

        // recover zcash_primitive for zip32 ExtendedSpendingKey from instance
        let xsk = xsk_m.0;
        let child_index = ChildIndex::NonHardened(1);

        let child = xsk.derive_child(child_index);
        let (diversifier_index, address) = child.default_address();

        assert_eq!(address.to_bytes().len(), 43);
        assert_eq!(diversifier_index.0, [0; 11]);
        assert_eq!(
            address.diversifier().0,
            [93, 200, 58, 67, 210, 217, 81, 15, 136, 189, 97]
        );
    }
}

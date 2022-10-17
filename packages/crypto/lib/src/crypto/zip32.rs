//! ShieldedHDWallet - Provide wasm_bindgen bindings for zip32 HD wallets
//! Imports from masp_primitives::zip32, instead of zcash_primitives::zip32, as
//! the value for constant ZIP32_SAPLING_MASTER_PERSONALIZATION is different!
//! Otherwise, these implementations should be equivalent.
use masp_primitives::zip32::{
    ChildIndex,
    ExtendedSpendingKey,
    ExtendedFullViewingKey,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;

const KEY_SIZE: usize = 96;
const ADDRESS_SIZE: usize = 43;
const DIVERSIFIER_INDEX_SIZE: usize = 11;
const SEED_SIZE: usize = 64;

#[derive(Debug, Error)]
pub enum Zip32Error {
    #[error("Invalid address size! Expected 43")]
    InvalidAddressSize,
    #[error("Invalid key size! Expected 96")]
    InvalidKeySize,
    #[error("Invalid diversifier index size! Expected 11")]
    InvalidDiversifierSize,
    #[error("Invalid seed length! Expected 64")]
    InvalidSeedSize,
    #[error("Could not derive child key!")]
    ChildDerivationerror,
}

#[wasm_bindgen]
pub struct ExtSpendingKey(pub (crate) ExtendedSpendingKey);

#[wasm_bindgen]
pub struct ExtFullViewingKey(pub (crate) ExtendedFullViewingKey);

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
pub struct Keys {
    expsk: [u8; KEY_SIZE],
    fvk: [u8; KEY_SIZE],
}

#[wasm_bindgen]
impl Keys {
    #[wasm_bindgen(constructor)]
    pub fn new(expsk: &[u8], fvk: &[u8]) -> Result<Keys, String> {
        let expsk: [u8; KEY_SIZE] = match expsk.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(
                format!("{}, {:?}", Zip32Error::InvalidKeySize, err),
            ),
        };
        let fvk: [u8; KEY_SIZE] = match fvk.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(
                format!("{}: {:?}", Zip32Error::InvalidKeySize, err),
            ),
        };

        Ok(Keys {
            expsk,
            fvk
        })
    }

    pub fn expsk(&self) -> Vec<u8> {
        let expsk: &[u8] = &self.expsk;
        Vec::from(expsk)
    }

    pub fn fvk(&self) -> Vec<u8> {
        let fvk: &[u8] = &self.fvk;
        Vec::from(fvk)
    }
}

#[wasm_bindgen]
pub struct PaymentAddress {
    diversifier: [u8; DIVERSIFIER_INDEX_SIZE],
    address: [u8; ADDRESS_SIZE],
}

#[wasm_bindgen]
impl PaymentAddress {
    #[wasm_bindgen(constructor)]
    pub fn new(diversifier: &[u8], address: &[u8]) -> Result<PaymentAddress, String> {
        let diversifier: [u8; DIVERSIFIER_INDEX_SIZE] = match diversifier.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(
                format!("{}: {:?}", Zip32Error::InvalidDiversifierSize, err),
            ),
        };
        let address: [u8; ADDRESS_SIZE] = match address.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(
                format!("{}: {:?}", Zip32Error::InvalidAddressSize, err),
            ),
        };

        Ok(PaymentAddress {
            diversifier,
            address,
        })
    }

    pub fn diversifier(&self) -> Vec<u8> {
        let diversifier: &[u8] = &self.diversifier;
        Vec::from(diversifier)
    }

    pub fn address(&self) -> Vec<u8> {
        let address: &[u8] = &self.address;
        Vec::from(address)
    }
}

#[wasm_bindgen]
pub struct ShieldedHDWallet {
    seed: [u8; SEED_SIZE],
    xsk_m: ExtendedSpendingKey,
    xfvk_m: ExtendedFullViewingKey,
}

#[wasm_bindgen]
impl ShieldedHDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: Vec<u8>) -> Result<ShieldedHDWallet, String> {
        // zip-0032 requires seed to be at least 32 and at most 252 bytes,
        // but the seed generated from our mnemonic will be 64, so let's
        // enforce it here:
        let seed: [u8; SEED_SIZE] = match seed.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(
                format!("{}: {:?}", Zip32Error::InvalidSeedSize, err),
            ),
        };

        let xsk_m = ExtendedSpendingKey::master(&seed);
        let xfvk_m = ExtendedFullViewingKey::from(&xsk_m);

        Ok(ShieldedHDWallet {
            seed,
            xsk_m,
            xfvk_m,
        })
    }

    pub fn derive(&self, index: u32) -> Result<Keys, String> {
        let c_index = ChildIndex::NonHardened(index);
        let child_sk = self.xsk_m.derive_child(c_index);
        let child_fvk = self.xfvk_m.derive_child(c_index)
            .map_err(|err| format!("{}: {:?}", Zip32Error::ChildDerivationerror, err))?;

        Ok(ShieldedHDWallet::derived_to_keys(
            ExtSpendingKey(child_sk),
            ExtFullViewingKey(child_fvk),
        ))
    }

    pub fn derived_to_keys(
        ext_sk: ExtSpendingKey,
        ext_fvk: ExtFullViewingKey,
    ) -> Keys {
        let expsk = ext_sk.0.expsk.to_bytes();
        let fvk = ext_fvk.0.fvk.to_bytes();

        Keys {
            expsk,
            fvk,
        }
    }

    pub fn derive_from_ext(
        ext_sk: ExtSpendingKey,
        ext_fvk: ExtFullViewingKey,
        index: u32,
    ) -> Result<Keys, String> {
        let c_index = ChildIndex::NonHardened(index);
        let child_sk = ext_sk.0.derive_child(c_index);
        let child_fvk = ext_fvk.0.derive_child(c_index)
            .map_err(|err| format!("{}: {:?}", Zip32Error::ChildDerivationerror, err))?;

        Ok(ShieldedHDWallet::derived_to_keys(
            ExtSpendingKey(child_sk),
            ExtFullViewingKey(child_fvk),
        ))
    }

    pub fn seed(&self) -> Vec<u8> {
        let seed: &[u8] = &self.seed;
        Vec::from(seed)
    }

    pub fn extended_master_keys(&self) -> ExtendedKeys {
        ExtendedKeys {
            xsk: ExtSpendingKey(self.xsk_m),
            xfvk: ExtFullViewingKey(self.xfvk_m),
        }
    }

    pub fn master_keys(&self) -> Keys {
        let expsk = self.xsk_m.expsk.to_bytes();
        let fvk = self.xfvk_m.fvk.to_bytes();

        Keys {
            expsk,
            fvk,
        }
    }

    pub fn master_sk_address(&self) -> PaymentAddress {
        let (diversifier, address) = &self.xsk_m.default_address();

        PaymentAddress {
            diversifier: diversifier.0,
            address: address.to_bytes(),
        }
    }

    pub fn master_fvk_address(&self) -> PaymentAddress {
        let (diversifier, address) = &self.xfvk_m.default_address();

        PaymentAddress {
            diversifier: diversifier.0,
            address: address.to_bytes(),
        }
    }

    pub fn ext_expsk_to_address(ext_xsk: ExtSpendingKey) -> PaymentAddress {
        let (diversifier, address) = ext_xsk.0.default_address();
        let diversifier = diversifier.0;
        let address = address.to_bytes();

        PaymentAddress {
            diversifier,
            address,
        }
    }

    pub fn ext_fvk_to_address(ext_fvk: ExtFullViewingKey) -> PaymentAddress {
        let (diversifier, address) = ext_fvk.0.default_address();
        let diversifier = diversifier.0;
        let address = address.to_bytes();

        PaymentAddress {
            diversifier,
            address,
        }
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

    #[test]
    fn can_instantiate_from_seed() {
        let seed: &[u8] = &[0; 64];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed));

        assert!(shielded_wallet.is_ok());

        let shielded_wallet = shielded_wallet.unwrap();
        let m_sk_address = shielded_wallet.master_sk_address();

        let expected: &[u8] = &[197, 222, 151, 151, 40, 202, 42, 29, 98, 195, 191,
                                242, 148, 114, 44, 137, 224, 97, 228, 207, 182, 163,
                                251, 87, 187, 142, 33, 116, 98, 49, 185, 36, 174,
                                146, 13, 55, 213, 0, 64, 131, 22, 118, 7];

        assert_eq!(m_sk_address.address(), Vec::from(expected));
    }

    #[test]
    fn can_derive_child_keys() {
        let seed: &[u8] = &[0; SEED_SIZE];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed))
            .expect("Should be able to instantiate ShieldedHDWallet");

        let Keys { expsk, fvk } = shielded_wallet.derive(1)
            .expect("Should derive child extended keys!");

        // ExpandedSpendingKey
        // ask + nsk + ovk - 96 bytes
        let expsk_expected = [71, 230, 226, 2, 146, 75, 94, 233, 234, 254, 128, 142,
                              209, 73, 65, 180, 64, 235, 159, 125, 24, 77, 12, 246,
                              113, 174, 41, 217, 5, 190, 215, 6, 76, 189, 55, 31, 96,
                              85, 114, 22, 215, 250, 140, 98, 162, 95, 203, 154, 180,
                              0, 231, 40, 172, 36, 137, 30, 142, 181, 225, 143, 180,
                              110, 135, 2, 213, 181, 237, 102, 55, 178, 202, 2, 123,
                              161, 104, 49, 91, 37, 62, 52, 132, 72, 103, 7, 60, 110,
                              171, 49, 22, 100, 146, 44, 79, 205, 112, 25];
        // FullViewingKey
        // vk + ovk - 96 bytes
        let fvk_expected = [231, 141, 253, 33, 141, 45, 47, 253, 94, 99, 2, 58, 233, 84,
                            152, 142, 60, 45, 175, 100, 10, 5, 32, 126, 133, 46, 214, 50,
                            136, 235, 250, 73, 125, 112, 103, 142, 119, 204, 205, 75, 30,
                            208, 119, 223, 218, 19, 88, 206, 173, 185, 244, 228, 224, 32,
                            104, 193, 189, 255, 9, 147, 22, 21, 240, 191, 213, 181, 237,
                            102, 55, 178, 202, 2, 123, 161, 104, 49, 91, 37, 62, 52, 132,
                            72, 103, 7, 60, 110, 171, 49, 22, 100, 146, 44, 79, 205, 112, 25];

        assert_eq!(expsk, expsk_expected);
        assert_eq!(expsk.len(), KEY_SIZE);
        assert_eq!(fvk, fvk_expected);
        assert_eq!(fvk.len(), KEY_SIZE);
    }

    #[test]
    fn can_derive_child_from_extended_keys() {
        let seed: &[u8] = &[0; SEED_SIZE];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed))
            .expect("Instantiating ShieldedHDWallet should not fail");

        let ExtendedKeys { xsk, xfvk } = shielded_wallet.extended_master_keys();
        let Keys { expsk, fvk } = ShieldedHDWallet::derive_from_ext(xsk, xfvk, 1)
            .expect("Deriving from ExtendedKeys should not fail");

        assert_eq!(expsk.len(), KEY_SIZE);
        assert_eq!(fvk.len(), KEY_SIZE);
    }

    #[test]
    fn can_recover_native_spending_key_from_child() {
        let seed: &[u8] = &[0; SEED_SIZE];
        let shielded_wallet = ShieldedHDWallet::new(Vec::from(seed))
            .expect("Instantiating ShieldedHDWallet should not fail");
        let ext_keys = shielded_wallet.extended_master_keys();

        // recover zcash_primitive for zip32 ExtendedSpendingKey from instance
        let xsk = ext_keys.xsk.0;
        let child_index = ChildIndex::NonHardened(1);

        let child = xsk.derive_child(child_index);
        let (diversifier_index, address) = child.default_address();

        assert_eq!(address.to_bytes().len(), ADDRESS_SIZE);
        assert_eq!(diversifier_index.0, [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        assert_eq!(
            address.diversifier().0,
            [100, 199, 34, 96, 93, 67, 18, 95, 86, 139, 123],
        );
    }
}

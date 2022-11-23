//! PaymentAddress - Provide wasm_bindgen bindings for shielded addresses
//! See @anoma/crypto for zip32 HD wallet functionality.
use namada::types::masp;
use masp_primitives::{
    zip32,
    primitives,
};
use borsh::BorshDeserialize;
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Error)]
pub enum MaspError {
    #[error("PaymentAddress from_str failed!")]
    PaymentAddress,
    #[error("BorshDeserialize failed!")]
    BorshDeserialize,
}

/// Wrap masp::ExtendedViewingKey
#[wasm_bindgen]
pub struct ExtendedViewingKey(pub (crate) masp::ExtendedViewingKey);

/// wasm_bindgen bindings for ExtendedViewingKey
#[wasm_bindgen]
impl ExtendedViewingKey {
    /// Instantiate ExtendedViewingKey from serialized vector
    #[wasm_bindgen(constructor)]
    pub fn new(key: &[u8]) -> Result<ExtendedViewingKey, String> {
        let xfvk: zip32::ExtendedFullViewingKey = BorshDeserialize::try_from_slice(key)
            .map_err(|err| format!("{}: {:?}", MaspError::BorshDeserialize, err))?;

        let vk = masp::ExtendedViewingKey::from(xfvk);

        Ok(ExtendedViewingKey(vk))
    }

    /// Return ExtendedViewingKey as Bech32-encoded String
    pub fn encode(&self) -> String {
        self.0.to_string()
    }
}

/// Wrap masp::ExtendedSpendingKey
#[wasm_bindgen]
pub struct ExtendedSpendingKey(pub (crate) masp::ExtendedSpendingKey);

/// wasm_bindgen bindings for ExtendedViewingKey
#[wasm_bindgen]
impl ExtendedSpendingKey {
    /// Instantiate ExtendedSpendingKey from serialized vector
    #[wasm_bindgen(constructor)]
    pub fn new(key: &[u8]) -> Result<ExtendedSpendingKey, String> {
        let xsk: zip32::ExtendedSpendingKey = BorshDeserialize::try_from_slice(key)
            .map_err(|err| format!("{}: {:?}", MaspError::BorshDeserialize, err))?;

        let xsk = masp::ExtendedSpendingKey::from(xsk);

        Ok(ExtendedSpendingKey(xsk))
    }

    /// Return ExtendedSpendingKey as Bech32-encoded String
    pub fn encode(&self) -> String {
        self.0.to_string()
    }
}

/// Wrap masp::PaymentAddress
#[wasm_bindgen]
pub struct PaymentAddress(pub (crate) masp::PaymentAddress);

/// wasm_bindgen bindings for PaymentAddress
#[wasm_bindgen]
impl PaymentAddress {
    /// Instantiate PaymentAddress from serialized vector
    #[wasm_bindgen(constructor)]
    pub fn new(address: &[u8]) -> Result<PaymentAddress, String> {
        let payment_address: primitives::PaymentAddress = BorshDeserialize::try_from_slice(address)
            .map_err(|err| format!("{}: {:?}", MaspError::BorshDeserialize, err))?;
        let payment_address = masp::PaymentAddress::from(payment_address);
        Ok(PaymentAddress(payment_address))
    }

    /// Returns a pinned or non-pinned PaymentAddress
    pub fn pinned(&self, pin: bool) -> PaymentAddress {
        PaymentAddress(self.0.pinned(pin))
    }

    /// Determine whether this PaymentAddress is pinned
    pub fn is_pinned(&self) -> bool {
        self.0.is_pinned()
    }

    /// Retrieve PaymentAddress hash
    pub fn hash(&self) -> String {
        self.0.hash()
    }

    /// Return PaymentAddress as Bech32-encoded String
    pub fn encode(&self) -> String {
        self.0.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_deserialize_an_extended_spending_key() {
        // BorshSerialize'd slice, generated from @anoma/crypto - zip32
        let encoded_xsk: &[u8] = &[1, 233, 222, 184, 155, 1, 0, 0, 0, 232, 94, 130, 41, 9, 58, 197, 35, 245, 249, 232,
                                   225, 222, 38, 148, 105, 204, 14, 230, 30, 241, 22, 214, 38, 221, 49, 17, 147, 255, 136,
                                   219, 250, 71, 230, 226, 2, 146, 75, 94, 233, 234, 254, 128, 142, 209, 73, 65, 180, 64,
                                   235, 159, 125, 24, 77, 12, 246, 113, 174, 41, 217, 5, 190, 215, 6, 76, 189, 55, 31, 96,
                                   85, 114, 22, 215, 250, 140, 98, 162, 95, 203, 154, 180, 0, 231, 40, 172, 36, 137, 30,
                                   142, 181, 225, 143, 180, 110, 135, 2, 213, 181, 237, 102, 55, 178, 202, 2, 123, 161, 104,
                                   49, 91, 37, 62, 52, 132, 72, 103, 7, 60, 110, 171, 49, 22, 100, 146, 44, 79, 205, 112,
                                   25, 36, 51, 226, 228, 45, 242, 201, 220, 212, 220, 58, 92, 127, 47, 214, 59, 174, 182,
                                   74, 90, 65, 229, 187, 76, 65, 246, 34, 237, 107, 208, 178, 243];
        let xsk = ExtendedSpendingKey::new(encoded_xsk)
            .expect("Instantiating ExtendedSpendingKey struct should not fail!");

        let key = xsk.encode();
        let expected_key =
            format!(
                "{}{}{}",
                "xsktest1q85aawymqyqqqq8gt6pzjzf6c53lt70gu80zd9rfes8wv8h3zmtzdhf3zxfllzxmlfr7dcszjf94a602l6qga52fgx6yp6ul",
                "05vy6r8kwxhznkg9hmtsvn9axu0kq4tjzmtl4rrz5f0uhx45qrnj3tpy3y0gad0p376xapcz6k676e3hkt9qy7apdqc4kff7xjzysec8",
                "83h2kvgkvjfzcn7dwqvjgvlzuskl9jwu6nwr5hrl9ltrht4kffdyredmf3qlvghdd0gt9uc8v6hz3",
            );

        assert!(key.starts_with("xsktest"));
        assert_eq!(key, expected_key);
    }

    #[test]
    fn can_deserialize_an_extended_viewing_key() {
        // BorshSerialize'd slice, generated from @anoma/crypto - zip32
        let encoded_xfvk: &[u8] = &[1, 233, 222, 184, 155, 1, 0, 0, 0, 232, 94, 130, 41, 9, 58, 197, 35, 245, 249, 232,
                                    225, 222, 38, 148, 105, 204, 14, 230, 30, 241, 22, 214, 38, 221, 49, 17, 147, 255, 136,
                                    219, 250, 231, 141, 253, 33, 141, 45, 47, 253, 94, 99, 2, 58, 233, 84, 152, 142, 60,
                                    45, 175, 100, 10, 5, 32, 126, 133, 46, 214, 50, 136, 235, 250, 73, 125, 112, 103, 142,
                                    119, 204, 205, 75, 30, 208, 119, 223, 218, 19, 88, 206, 173, 185, 244, 228, 224, 32, 104,
                                    193, 189, 255, 9, 147, 22, 21, 240, 191, 213, 181, 237, 102, 55, 178, 202, 2, 123, 161,
                                    104, 49, 91, 37, 62, 52, 132, 72, 103, 7, 60, 110, 171, 49, 22, 100, 146, 44, 79, 205,
                                    112, 25, 36, 51, 226, 228, 45, 242, 201, 220, 212, 220, 58, 92, 127, 47, 214, 59, 174,
                                    182, 74, 90, 65, 229, 187, 76, 65, 246, 34, 237, 107, 208, 178, 243];
        let xfvk = ExtendedViewingKey::new(encoded_xfvk)
            .expect("Instantiating ExtendedViewingKey struct should not fail!");

        let key = xfvk.encode();
        let expected_key =
            format!(
                "{}{}{}",
                "xfvktest1q85aawymqyqqqq8gt6pzjzf6c53lt70gu80zd9rfes8wv8h3zmtzdhf3zxfllzxmltncmlfp35kjll27vvpr4625nz8rctd",
                "0vs9q2gr7s5hdvv5ga0ayjltsv7880nxdfv0dqa7lmgf43n4dh86wfcpqdrqmmlcfjvtptu9l6k676e3hkt9qy7apdqc4kff7xjzysec8",
                "83h2kvgkvjfzcn7dwqvjgvlzuskl9jwu6nwr5hrl9ltrht4kffdyredmf3qlvghdd0gt9ucvxyquf",
            );
        assert!(key.starts_with("xfvktest"));
        assert_eq!(key, expected_key);
    }

    #[test]
    fn can_deserialize_a_payment_address() {
        // BorshSerialize'd slice, generated from @anoma/crypto - zip32
        let encoded_payment_address: &[u8] = &[100, 199, 34, 96, 93, 67, 18, 95, 86, 139, 123, 213, 141, 228, 147, 169, 218,
                                               247, 75, 83, 195, 72, 73, 44, 65, 232, 243, 229, 209, 63, 183, 1, 87, 87, 203,
                                               40, 180, 242, 103, 187, 245, 224, 36];
        let payment_address = PaymentAddress::new(encoded_payment_address)
            .expect("Instantiating PaymentAddress struct should not fail!");

        let address = payment_address.encode();
        let hash = payment_address.hash();

        let expected_address = "patest1vnrjyczagvf9745t002cmeyn48d0wj6ncdyyjtzpare7t5flkuq4w47t9z60yeam7hszga07g7t";
        let expected_hash = "DBF7C3440E0C0B81EBBB95AD26DA6D875C19BC45";

        assert!(address.starts_with("patest"));
        assert_eq!(address, expected_address);
        assert_eq!(hash, expected_hash);
    }

    #[test]
    fn can_pin_a_payment_address() {
        let encoded_payment_address: &[u8] = &[100, 199, 34, 96, 93, 67, 18, 95, 86, 139, 123, 213, 141, 228, 147, 169, 218,
                                               247, 75, 83, 195, 72, 73, 44, 65, 232, 243, 229, 209, 63, 183, 1, 87, 87, 203,
                                               40, 180, 242, 103, 187, 245, 224, 36];
        let payment_address = PaymentAddress::new(encoded_payment_address)
            .expect("Instantiating PaymentAddress struct should not fail!");

        let is_pinned = payment_address.is_pinned();
        assert!(!is_pinned);

        let payment_address = payment_address.pinned(true);
        assert!(payment_address.is_pinned());
    }
}

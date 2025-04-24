/*!
ShieldedHDWallet - Provide wasm_bindgen bindings for zip32 HD wallets
Imports from masp_primitives::zip32, instead of zcash_primitives::zip32, as
the value for constant ZIP32_SAPLING_MASTER_PERSONALIZATION is different!
Otherwise, these implementations should be equivalent.
*/
use borsh::BorshDeserialize;
use borsh_ext::BorshSerializeExt;
use masp_primitives::{
    sapling::PaymentAddress,
    zip32::{sapling, ChildIndex, ExtendedFullViewingKey, ExtendedSpendingKey},
};
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[wasm_bindgen]
#[derive(Zeroize)]
pub struct DerivationResult {
    xsk: Vec<u8>,
    xfvk: Vec<u8>,
    payment_address: Vec<u8>,
}

#[wasm_bindgen]
impl DerivationResult {
    pub fn xsk(&self) -> Vec<u8> {
        self.xsk.clone()
    }

    pub fn xfvk(&self) -> Vec<u8> {
        self.xfvk.clone()
    }

    pub fn payment_address(&self) -> Vec<u8> {
        self.payment_address.clone()
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct ShieldedHDWallet {
    seed: [u8; 32],
}

#[wasm_bindgen]
impl ShieldedHDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: JsValue, path: Vec<u32>) -> Result<ShieldedHDWallet, String> {
        let seed = js_sys::Uint8Array::from(seed).to_vec();
        let sk = slip10_ed25519::derive_ed25519_private_key(&seed, &path);

        Ok(ShieldedHDWallet { seed: sk })
    }

    pub fn new_from_sk(sk_bytes: Vec<u8>) -> Result<ShieldedHDWallet, String> {
        let sk: [u8; 32] = match sk_bytes.try_into() {
            Ok(bytes) => bytes,
            Err(err) => return Err(format!("Invalid Private Key! {:?}", err)),
        };

        Ok(ShieldedHDWallet { seed: sk })
    }

    pub fn derive(
        &self,
        path: Vec<u32>,
        diversifier: Option<Vec<u8>>,
    ) -> Result<DerivationResult, String> {
        let master_spend_key = sapling::ExtendedSpendingKey::master(&self.seed);

        let purpose = path.first().expect("zip32 purpose is required!");
        let coin_type = path.get(1).expect("zip32 coin_type is required!");
        let account = path.get(2).expect("zip32 account is required!");

        // Optional address index
        let address_index = path.get(3);

        let mut zip32_path: Vec<ChildIndex> = [purpose, coin_type, account]
            .iter()
            .map(|i| ChildIndex::Hardened(**i))
            .collect();

        if let Some(index) = address_index {
            zip32_path.push(ChildIndex::NonHardened(*index));
        }

        let xsk: ExtendedSpendingKey =
            ExtendedSpendingKey::from_path(&master_spend_key, &zip32_path);

        let xfvk = ExtendedFullViewingKey::from(&xsk);

        // We either use passed diversifier or the default payment_address
        let payment_address: PaymentAddress = match diversifier {
            Some(d) => {
                let diversifier = BorshDeserialize::try_from_slice(&d).unwrap();
                xfvk.fvk.vk.to_payment_address(diversifier).unwrap()
            }
            None => xfvk.default_address().1,
        };

        Ok(DerivationResult {
            xsk: xsk.serialize_to_vec(),
            xfvk: xfvk.serialize_to_vec(),
            payment_address: payment_address.serialize_to_vec(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::bip39;
    use masp_primitives::sapling::PaymentAddress;
    use wasm_bindgen_test::*;

    const KEY_SIZE: usize = 96;

    #[wasm_bindgen_test]
    fn can_instantiate_from_seed() {
        let seed = JsValue::from(js_sys::Uint8Array::new_with_length(64));
        let path = vec![44, 877, 0, 0, 0];
        let shielded_wallet = ShieldedHDWallet::new(seed, path);

        assert!(shielded_wallet.is_ok());
    }

    #[wasm_bindgen_test]
    fn can_derive_shielded_key_to_serialized() {
        let seed = JsValue::from(js_sys::Uint8Array::new_with_length(64));
        let path = vec![44, 877, 0, 0, 0];
        let shielded_wallet = ShieldedHDWallet::new(seed, path)
            .expect("Instantiating ShieldedHDWallet should not fail");

        let DerivationResult {
            ref payment_address,
            ref xsk,
            ref xfvk,
        } = shielded_wallet
            .derive(vec![32, 877, 0], None)
            .expect("Deriving from ExtendedKeys should not fail");

        let payment_address: PaymentAddress =
            borsh::BorshDeserialize::try_from_slice(payment_address)
                .expect("Should be able to deserialize payment address!");
        let xsk: ExtendedSpendingKey = borsh::BorshDeserialize::try_from_slice(xsk)
            .expect("Should be able to deserialize extended spending key!");
        let xfvk: ExtendedFullViewingKey = borsh::BorshDeserialize::try_from_slice(xfvk)
            .expect("Should be able to deserialize full viewing key!");

        assert_eq!(payment_address.to_bytes().len(), 43);
        assert_eq!(xsk.expsk.to_bytes().len(), KEY_SIZE);
        assert_eq!(xfvk.fvk.to_bytes().len(), KEY_SIZE);
    }

    #[wasm_bindgen_test]
    fn can_restore_shielded_keys_from_mnemonic() {
        let phrase = "great sphere inmate december menu warrior adjust glass flat heavy act mail";
        let mnemonic = bip39::Mnemonic::from_phrase(phrase.into()).unwrap();
        let seed = mnemonic
            .to_seed(None)
            .expect("Should return seed from mnemonic phrase");
        let path = vec![44, 877, 0, 0, 0];

        let shielded_wallet = ShieldedHDWallet::new(JsValue::from(seed), path)
            .expect("Instantiating ShieldedHDWallet should not fail");

        let shielded_account = shielded_wallet
            .derive(vec![32, 877, 0], None)
            .expect("Deriving from ExtendedKeys should not fail");

        let payment_address = PaymentAddress::try_from_slice(&shielded_account.payment_address())
            .expect("should instantiate from serialized bytes");
        let xfvk = ExtendedFullViewingKey::try_from_slice(&shielded_account.xfvk())
            .expect("should instantiate from serialized bytes");

        assert_eq!(payment_address.to_string(), "efad0a092281f049a04250b91b84a8454cec0c5da75821ef7fd2deb684201cc83dd7bb287c241b11cd88d9");
        assert_eq!(
            xfvk.fvk.to_string(),
            format!(
                "{}{}{}",
                "a654d32c7b361f77a774a3f80c7dcd053a9e904f0c3bab1e9e207ed4e01434103fa",
                "d5db7d3784841e0dd5f1b931b515186da3058562c103eaf11dc665c9da19f12ea71",
                "19818ed1f124bd0573f15a82e97893664b7bc3e80b19ed96ba4f52eef3",
            )
        );
    }
}

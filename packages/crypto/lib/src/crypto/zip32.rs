//! ShieldedHDWallet - Provide wasm_bindgen bindings for zip32 HD wallets
//! Imports from masp_primitives::zip32, instead of zcash_primitives::zip32, as
//! the value for constant ZIP32_SAPLING_MASTER_PERSONALIZATION is different!
//! Otherwise, these implementations should be equivalent.
use borsh::BorshDeserialize;
use borsh_ext::BorshSerializeExt;
use masp_primitives::{
    sapling::PaymentAddress,
    zip32::{sapling, ChildIndex, ExtendedFullViewingKey, ExtendedSpendingKey},
};
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[wasm_bindgen]
pub struct ExtSpendingKey(pub(crate) ExtendedSpendingKey);

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
    seed: [u8; 64],
}

#[wasm_bindgen]
impl ShieldedHDWallet {
    #[wasm_bindgen(constructor)]
    pub fn new(seed: JsValue) -> Result<ShieldedHDWallet, String> {
        let seed = js_sys::Uint8Array::from(seed).to_vec();

        Ok(ShieldedHDWallet {
            seed: seed.try_into().map_err(|_| "Invalid seed length")?,
        })
    }

    pub fn derive(
        &self,
        path: Vec<u32>,
        diversifier: Option<Vec<u8>>,
    ) -> Result<DerivationResult, String> {
        let master_spend_key = sapling::ExtendedSpendingKey::master(&self.seed);

        let zip32_path: Vec<ChildIndex> = path.iter().map(|i| ChildIndex::Hardened(*i)).collect();
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
    use masp_primitives::sapling::PaymentAddress;
    use wasm_bindgen_test::*;

    const KEY_SIZE: usize = 96;

    #[wasm_bindgen_test]
    fn invalid_seed_should_panic() {
        let seed = JsValue::from(js_sys::Uint8Array::new_with_length(60));

        let res = ShieldedHDWallet::new(seed);

        assert!(res.is_err());
    }

    #[wasm_bindgen_test]
    fn can_instantiate_from_seed() {
        let seed = JsValue::from(js_sys::Uint8Array::new_with_length(64));
        let shielded_wallet = ShieldedHDWallet::new(seed);

        assert!(shielded_wallet.is_ok());
    }

    #[wasm_bindgen_test]
    fn can_derive_child_to_serialized() {
        let seed = JsValue::from(js_sys::Uint8Array::new_with_length(64));
        let shielded_wallet =
            ShieldedHDWallet::new(seed).expect("Instantiating ShieldedHDWallet should not fail");

        let DerivationResult {
            ref payment_address,
            ref xsk,
            ref xfvk,
        } = shielded_wallet
            .derive(vec![32, 877, 0], None)
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

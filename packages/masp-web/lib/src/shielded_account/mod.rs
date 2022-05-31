use crate::shielded_transaction::utils::{console_log, console_log_any};
use anoma::types::masp::{ExtendedSpendingKey, ExtendedViewingKey, PaymentAddress};
use masp_primitives_from_murisi::primitives::{
    Diversifier, PaymentAddress as PrimitivesPaymentAddress,
};
use masp_primitives_from_murisi::zip32::ExtendedFullViewingKey;
use rand::rngs::OsRng;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(typescript_custom_section)]
const ITEXT_STYLE: &'static str = r#"
type ShieldedAccountType = {
    viewing_key: string;
    spending_key: string;
    payment_address: string;
}
"#;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "ShieldedAccountType")]
    pub type ShieldedAccountType;
}

#[derive(Serialize, Deserialize)]
pub struct ShieldedAccount {
    viewing_key: String,
    spending_key: String,
    payment_address: String,
}

// TODO removed CryptoRng trait from rng
pub fn find_valid_diversifier<R: RngCore>(rng: &mut R) -> (Diversifier, jubjub::SubgroupPoint) {
    let mut diversifier;
    let g_d;
    // Keep generating random diversifiers until one has a diversified base
    loop {
        let mut d = [0; 11];
        rng.fill_bytes(&mut d);
        diversifier = Diversifier(d);
        if let Some(val) = diversifier.g_d() {
            g_d = val;
            break;
        }
    }
    (diversifier, g_d)
}

#[wasm_bindgen]
impl ShieldedAccount {
    // utils to transform between ExtendedSpendingKey in masp_primitives and PaymentAddress in anoma/shared/masp
    fn generate_spending_key_from_seed() -> ExtendedSpendingKey {
        let mut spend_key = [0; 32];
        OsRng.fill_bytes(&mut spend_key);
        masp_primitives_from_murisi::zip32::ExtendedSpendingKey::master(spend_key.as_ref()).into()
    }

    fn generate_spending_key_from_path() -> ExtendedSpendingKey {
        let mut spend_key = [0; 32];
        OsRng.fill_bytes(&mut spend_key);
        masp_primitives_from_murisi::zip32::ExtendedSpendingKey::master(spend_key.as_ref()).into()
    }

    // utils to transform between ExtendedFullViewingKey in masp_primitives and PaymentAddress in anoma/shared/masp
    fn generate_viewing_key(primitives_viewing_key: ExtendedFullViewingKey) -> ExtendedViewingKey {
        primitives_viewing_key.into()
    }

    // utils to transform between PaymentAddress in masp_primitives and PaymentAddress in anoma/shared/masp
    fn generate_payment_address(
        primitives_payment_address: PrimitivesPaymentAddress,
    ) -> PaymentAddress {
        primitives_payment_address.into()
    }

    // generates a struct that contains spending and viewing keys as well as a payment address
    pub fn new_master_account(alias: String, seed: String, password: Option<String>) -> JsValue {
        let extended_spending_key = Self::generate_spending_key_from_seed();
        Self::new_from_spending_key(alias, extended_spending_key, password)
    }

    pub fn new_derived_account(alias: String, path: String, password: Option<String>) -> JsValue {
        let extended_spending_key = Self::generate_spending_key_from_seed();
        Self::new_from_spending_key(alias, extended_spending_key, password)
    }

    fn new_from_spending_key(
        alias: String,
        extended_spending_key: ExtendedSpendingKey,
        password: Option<String>,
    ) -> JsValue {
        // viewing key
        let extended_full_viewing_key = ExtendedFullViewingKey::from(&extended_spending_key.into());
        let extended_viewing_key = Self::generate_viewing_key(extended_full_viewing_key);
        let full_viewing_key = extended_full_viewing_key.fvk;
        let viewing_key = full_viewing_key.vk;

        // payment address
        let (valid_diversifier, _sub_group_point) = find_valid_diversifier(&mut OsRng);
        let payment_address_maybe = viewing_key.to_payment_address(valid_diversifier);
        let payment_address_as_string = match payment_address_maybe {
            Some(payment_address) => {
                let payment_address = Self::generate_payment_address(payment_address);
                payment_address.to_string()
            }
            None => "".to_string(),
        };

        let shielded_account = ShieldedAccount {
            viewing_key: extended_viewing_key.to_string(),
            spending_key: extended_spending_key.to_string(),
            payment_address: payment_address_as_string,
        };

        JsValue::from_serde(&shielded_account).unwrap()
    }
}

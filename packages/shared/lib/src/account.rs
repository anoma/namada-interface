use namada::types::{
    key::{
        self,
        common::{PublicKey, SecretKey},
        RefTo,
    },
    transaction::InitAccount,
};
use borsh::{BorshSerialize, BorshDeserialize};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
pub struct AccountMsg {
    vp_code: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Serialize,Deserialize)]
pub struct Account {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Account {
    /// Create an init-account struct
    #[wasm_bindgen(constructor)]
    pub fn new(
        msg: &[u8],
        secret: &str,
    ) -> Result<Account, String> {
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| format!("BorshDeserialize failed! {:?}", err))?;
        let AccountMsg { vp_code } = msg;

        let secret_key = key::ed25519::SecretKey::from_str(secret)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))?;
        let signing_key = SecretKey::Ed25519(secret_key);

        // TODO: Fix the following conversion
        #[allow(clippy::useless_conversion)]
        let public_key = PublicKey::from(signing_key.ref_to());

        let init_account = InitAccount {
            public_key,
            vp_code,
        };

        let tx_data = init_account
            .try_to_vec()
            .map_err(|err| err.to_string())?;

        Ok(Account {
            tx_data,
        })
    }

    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let serialized = JsValue::from_serde(&self)
            .map_err(|err| err.to_string())?;
        Ok(serialized)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_init_account() {
        let secret = "1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93";
        let msg = AccountMsg {  vp_code: vec![] };

        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize to vector");

        let Account { tx_data } = Account::new(&msg_serialized, secret)
            .expect("Should be able to create an Account from serialized message");

        assert_eq!(tx_data.len(), 37);
    }
}

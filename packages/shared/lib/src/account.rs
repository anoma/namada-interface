use crate::types::transaction::Transaction;
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
    secret: String,
    vp_code: Vec<u8>,
}

#[wasm_bindgen]
#[derive(Serialize,Deserialize)]
pub struct Account {
    tx_data: Vec<u8>,
}

#[wasm_bindgen]
impl Account {
    /// Initialize an account on the Ledger
    #[wasm_bindgen(constructor)]
    pub fn new(
        msg: Vec<u8>,
    ) -> Result<Account, String> {
        let msg: &[u8] = &msg;
        let msg = BorshDeserialize::try_from_slice(msg)
            .map_err(|err| err.to_string())?;
        let AccountMsg { secret, vp_code } = msg;

        let secret_key = key::ed25519::SecretKey::from_str(&secret)
            .expect("ed25519 encoding should not fail");
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
            .expect("Encoding tx data shouldn't fail");

        Ok(Account {
            tx_data,
        })
    }

    pub fn to_tx(
        &self,
        msg: Vec<u8>,
    ) -> Result<JsValue, JsValue> {
        let transaction = Transaction::new(msg, &self.tx_data)?;
        Ok(JsValue::from_serde(&transaction.serialize()).unwrap())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::transaction::{SerializedTx, TransactionMsg};
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_init_account_transaction() {
        let secret = String::from("1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93");
        let token = String::from("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5");
        let epoch = 5;
        let fee_amount = 1000;
        let gas_limit = 1_000_000;

        let tx_code = vec![];
        let vp_code = vec![];
        let msg = AccountMsg { secret: secret.clone(), vp_code };

        let msg_serialized = BorshSerialize::try_to_vec(&msg)
            .expect("Message should serialize");

        let account = Account::new(msg_serialized)
            .expect("Should be able to create an Account from serialized message");

        let transaction_msg = TransactionMsg::new(secret, token, epoch, fee_amount, gas_limit, tx_code);
        let transaction_msg_serialized = BorshSerialize::try_to_vec(&transaction_msg)
            .expect("Message should serialize");

        let transaction = account.to_tx(transaction_msg_serialized)
            .expect("Should be able to convert to transaction");

        let serialized_tx: SerializedTx = JsValue::into_serde(&transaction)
            .expect("Should be able to serialize to a Transaction");

        let hash = serialized_tx.hash();
        let bytes = serialized_tx.bytes();

        assert_eq!(hash.len(), 64);
        assert_eq!(bytes.len(), 489);
    }
}

use crate::types::transaction::Transaction;
use gloo_utils::format::JsValueSerdeExt;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Signer {
    tx_data: Vec<u8>,
}

/// Wasm-compatible struct for wrapping Transaction signing functionality
#[wasm_bindgen]
impl Signer {
    #[wasm_bindgen(constructor)]
    pub fn new(tx_data: &[u8]) -> Signer {
        Signer {
            tx_data: Vec::from(tx_data),
        }
    }

    pub fn sign(&self, msg: &[u8], secret: &str) -> Result<JsValue, JsValue> {
        let transaction = Transaction::new(msg, secret, &self.tx_data)?;
        let js_value = JsValue::from_serde(&transaction.serialize()?)
            .map_err(|err| format!("Could not create JsValue from transaction: {:?}", err))?;
        Ok(js_value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::transaction::{SerializedTx, TransactionMsg};
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_sign_and_serialize_from_signer() {
        let secret = "1498b5467a63dffa2dc9d9e069caf075d16fc33fdd4c3b01bfadae6433767d93";
        let token =
            "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
        let epoch = 5;
        let fee_amount = 1000;
        let gas_limit = 1_000_000;
        let tx_code = vec![];
        let tx_data = vec![0, 1, 2, 3];

        let msg = TransactionMsg::new(
            token.to_string(),
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
            false,
        );
        let msg_serialized =
            borsh::BorshSerialize::try_to_vec(&msg).expect("Message should serialize");

        // Create signer instance for tx_data, where tx_data is some arbitrary data
        let signer = Signer::new(&tx_data);
        let transaction = signer
            .sign(&msg_serialized, secret)
            .expect("Should be able to convert to transaction");

        let serialized_tx: SerializedTx =
            JsValue::into_serde(&transaction).expect("Should be able to serialize transaction");

        let hash = serialized_tx.hash();
        let bytes = serialized_tx.bytes();

        assert_eq!(hash.len(), 64);
        assert_eq!(bytes.len(), 456);
    }
}

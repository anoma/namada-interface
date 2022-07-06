use borsh::{BorshDeserialize, BorshSerialize};
use masp_primitives::transaction::{Transaction, TxId};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

pub type TransactionWithPointerToNext = (Transaction, Option<TxId>);

// This is just a util for more easily be able to go from Ts -> Rust -> Ts
// When fetching the transactions we need to keep the tx for later and
// use the id of the next to fetch it
#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct NodeWithNextId {
    pub(crate) node: Option<Vec<u8>>,
    pub(crate) next_transaction_id: Option<String>,
}

#[wasm_bindgen]
impl NodeWithNextId {
    // transforms from
    // borsh_serialised((Transaction, Option<TxId>))
    // to
    // NodeWithNextId {node: borsh_serialised(Transaction), next_transaction_id: Option<String>}
    #[wasm_bindgen]
    pub fn decode_transaction_with_next_tx_id(transfer_as_byte_array: &[u8]) -> JsValue {
        let transaction_and_next_transaction_id_result =
            TransactionWithPointerToNext::try_from_slice(transfer_as_byte_array);

        // unwrap or return
        let node_with_next_id = match transaction_and_next_transaction_id_result {
            // common case
            Ok((transaction, Some(next_transaction_id))) => NodeWithNextId {
                node: Some(transaction.try_to_vec().unwrap()),
                next_transaction_id: Some(next_transaction_id.to_string()),
            },
            // the last transaction has no link to the next
            Ok((transaction, None)) => NodeWithNextId {
                node: Some(transaction.try_to_vec().unwrap()),
                next_transaction_id: None,
            },
            // The byte array could have contained also just an id of the next transaction
            // this is the case in the first block
            Err(_) => {
                // so we try to deserialise it again
                let next_transaction_id_result = TxId::try_from_slice(transfer_as_byte_array);
                match next_transaction_id_result {
                    Ok(next_transaction_id) => NodeWithNextId {
                        node: None,
                        next_transaction_id: Some(next_transaction_id.to_string()),
                    },
                    Err(_) => NodeWithNextId {
                        node: None,
                        next_transaction_id: None,
                    },
                }
            }
        };

        // transform the data
        serde_wasm_bindgen::to_value(&node_with_next_id).unwrap()
    }
}

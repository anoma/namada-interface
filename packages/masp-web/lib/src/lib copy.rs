mod shielded_transaction;
mod utils;

use borsh::{BorshDeserialize, BorshSerialize};
use ff::PrimeField;
use group::cofactor::CofactorGroup;
use masp_primitives::consensus::TestNetwork;
use masp_primitives::keys::ExpandedSpendingKey;
use masp_primitives::note_encryption::try_sapling_note_decryption;
use masp_primitives::primitives::{PaymentAddress, ViewingKey};
use masp_primitives::sapling::Node;
use masp_primitives::transaction::{Transaction, TransactionData, TxId};
use masp_primitives::zip32::{ExtendedFullViewingKey, ExtendedSpendingKey};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen;
use shielded_transaction::{compose_shielded_transaction, TransactionContext};
use std::convert::{TryFrom, TryInto};
use utils::console_log;
use wasm_bindgen::prelude::*;
use zcash_primitives::merkle_tree::IncrementalWitness;

use std::str::{self, FromStr};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

type TransactionWithPointerToNext = (Transaction, Option<TxId>);

#[wasm_bindgen]
pub fn perform_shielded_transaction(
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    payment_address_as_string: String,
) {
    console_log("perform_shielded_transaction 1");
    let payment_address_result = PaymentAddress::from_str(payment_address_as_string.as_str());

    let payment_address = match payment_address_result {
        Ok(payment_address) => payment_address,
        Err(error) => {
            console_log(error.to_string().as_str());
            return;
        }
    };

    console_log("perform_shielded_transaction 2");
    console_log(payment_address.to_string().as_str());
    console_log("perform_shielded_transaction 3");
    // let shielded_transactions_result =
    //     serde_wasm_bindgen::from_value::<Vec<NodeWithNextId>>(shielded_transactions);

    // let shielded_transactions = match shielded_transactions_result {
    //     Ok(shielded_transactions) => shielded_transactions,
    //     Err(_) => return,
    // };

    // let mut transactions: Vec<Transaction> = vec![];

    // // construct transactions
    // for shielded_transaction_with_next_id in shielded_transactions {
    //     if let node = shielded_transaction_with_next_id.node.unwrap() {
    //         let transaction_result = Transaction::try_from_slice(&node);
    //         if let transaction = transaction_result.unwrap() {
    //             transactions.push(transaction);
    //         }
    //     };
    // }

    let transactions_maybe = nodes_with_next_id_to_transactions(shielded_transactions);
    console_log("perform_shielded_transaction 4");
    if let Some(transactions) = transactions_maybe {
        console_log("perform_shielded_transaction 5");
        console_log(transactions.len().to_string().as_str());
    }

    let spending_key = spending_key_as_string;
    let payment_address = payment_address_as_string;

    // let spending_keys = ExpandedSpendingKey::
    // let payment_address = String::from("payment_address_1");
    // let transaction_context = load_shielded_transaction_context(transactions, payment_address);
    // compose_shielded_transaction(spending_key, payment_address, 1_000_000);
}

fn nodes_with_next_id_to_transactions(shielded_transactions: JsValue) -> Option<Vec<Transaction>> {
    let shielded_transactions_result =
        serde_wasm_bindgen::from_value::<Vec<NodeWithNextId>>(shielded_transactions);

    let shielded_transactions = match shielded_transactions_result {
        Ok(shielded_transactions) => shielded_transactions,
        Err(_) => return None,
    };

    console_log(shielded_transactions.len().to_string().as_str());
    // construct transactions
    let mut transactions: Vec<Transaction> = vec![];

    for shielded_transaction_with_next_id in shielded_transactions {
        if let Some(node) = shielded_transaction_with_next_id.node {
            let transaction_result = Transaction::try_from_slice(&node);
            if let Ok(transaction) = transaction_result {
                transactions.push(transaction);
            } else {
                console_log("err 2");
                console_log(transaction_result.err().unwrap().to_string().as_str());
            };
        } else {
            console_log("err 1");
        };
    }
    Some(transactions)
}

#[wasm_bindgen]
pub fn decode_transaction_with_next_tx_id(transfer_as_byte_array: &[u8]) -> Option<String> {
    // attempt to decode the byte array
    let transaction_with_transaction_with_next_tx_id_result =
        TransactionWithPointerToNext::try_from_slice(transfer_as_byte_array);

    // unwrap or return
    let transaction_with_next_tx_id = match transaction_with_transaction_with_next_tx_id_result {
        Ok(transaction_with_next_tx_id) => transaction_with_next_tx_id,
        // so it was not (Transaction, Option<TxId>)
        // lets see if it is TxId
        Err(_error) => {
            let next_tx_id_result = TxId::try_from_slice(transfer_as_byte_array);
            let next_tx_id = match next_tx_id_result {
                Ok(next_tx_id_optional) => next_tx_id_optional,
                Err(_error) => return None,
            };

            // turn to string and return
            return Some(next_tx_id.to_string());
        }
    };

    // get the next_tx_id
    let next_tx_id = match transaction_with_next_tx_id {
        (_transaction, Some(next_tx_id)) => next_tx_id,
        (_transaction, None) => return None,
    };

    Some(next_tx_id.to_string())
}

// #[wasm_bindgen]
// pub fn token_ranges(text: &str) -> Array {
//     get_vec_somehow().into_iter().collect()
// }

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct NodeWithNextId {
    node: Option<Vec<u8>>,
    next_transaction_id: Option<String>,
}

#[wasm_bindgen]
impl NodeWithNextId {
    #[wasm_bindgen]
    pub fn decode_transaction_with_next_tx_id_2(transfer_as_byte_array: &[u8]) -> Self {
        let transaction_with_transaction_with_next_tx_id_result =
            TransactionWithPointerToNext::try_from_slice(transfer_as_byte_array);

        // unwrap or return
        let transaction_with_next_tx_id = match transaction_with_transaction_with_next_tx_id_result
        {
            Ok(transaction_with_next_tx_id) => transaction_with_next_tx_id,
            Err(_error) => {
                // so it was not (Transaction, Option<TxId>)
                // lets see if it is TxId
                let next_tx_id_result = TxId::try_from_slice(transfer_as_byte_array);
                let next_tx_id = match next_tx_id_result {
                    Ok(next_tx_id_optional) => next_tx_id_optional,
                    Err(_error) => {
                        return NodeWithNextId {
                            node: None,
                            next_transaction_id: None,
                        }
                    }
                };

                // turn to string and return
                return NodeWithNextId {
                    node: None,
                    next_transaction_id: Some(next_tx_id.to_string()),
                };
            }
        };

        // get the next_tx_id
        let next_tx_id = match &transaction_with_next_tx_id {
            (_transaction, Some(next_tx_id)) => next_tx_id,
            (_transaction, None) => {
                return NodeWithNextId {
                    node: None,
                    next_transaction_id: None,
                }
            }
        };

        return NodeWithNextId {
            node: Some(transaction_with_next_tx_id.try_to_vec().unwrap()),
            next_transaction_id: Some(next_tx_id.to_string()),
        };
    }

    pub fn decode_transaction_with_next_tx_id(transfer_as_byte_array: &[u8]) -> JsValue {
        let transaction_with_transaction_with_next_tx_id_result =
            TransactionWithPointerToNext::try_from_slice(transfer_as_byte_array);

        // unwrap or return
        let transaction_with_next_tx_id = match transaction_with_transaction_with_next_tx_id_result
        {
            Ok(transaction_with_next_tx_id) => transaction_with_next_tx_id,
            Err(_error) => {
                // so it was not (Transaction, Option<TxId>)
                // lets see if it is TxId
                let next_tx_id_result = TxId::try_from_slice(transfer_as_byte_array);
                let next_tx_id = match next_tx_id_result {
                    Ok(next_tx_id_optional) => next_tx_id_optional,
                    Err(_error) => {
                        let aaa = NodeWithNextId {
                            node: None,
                            next_transaction_id: None,
                        };

                        return serde_wasm_bindgen::to_value(&aaa).unwrap();
                    }
                };

                // turn to string and return
                let aaa = NodeWithNextId {
                    node: None,
                    next_transaction_id: Some(next_tx_id.to_string()),
                };
                return serde_wasm_bindgen::to_value(&aaa).unwrap();
            }
        };

        // get the next_tx_id
        let next_tx_id = match &transaction_with_next_tx_id {
            (_transaction, Some(next_tx_id)) => next_tx_id,
            (_transaction, None) => {
                let aaa = NodeWithNextId {
                    node: None,
                    next_transaction_id: None,
                };

                return serde_wasm_bindgen::to_value(&aaa).unwrap();
            }
        };

        let aaa = NodeWithNextId {
            node: Some(transaction_with_next_tx_id.try_to_vec().unwrap()),
            next_transaction_id: Some(next_tx_id.to_string()),
        };
        serde_wasm_bindgen::to_value(&aaa).unwrap()
    }
}

// an util taking extended spending key ( look at 3.1 ) and returning viewing key ( look at 3.1 )
pub fn extended_spending_key_to_viewing_key(
    extended_spending_key: &ExtendedSpendingKey,
) -> ViewingKey {
    ExtendedFullViewingKey::from(extended_spending_key).fvk.vk
}

// creates the shielded transactions context
pub fn load_shielded_transaction_context(
    transactions: Vec<Transaction>,
    spending_keys: Vec<ExtendedSpendingKey>,
    viewing_keys: Vec<ViewingKey>,
) -> TransactionContext {
    let mut transaction_context = TransactionContext::default();

    // add spending_keys to context viewing_keys
    for spending_key in spending_keys {
        let transformed_viewing_key = extended_spending_key_to_viewing_key(&spending_key);
        transaction_context
            .viewing_keys
            .entry(transformed_viewing_key);
    }

    // add viewing_keys to context viewing_keys
    for viewing_key in viewing_keys {
        transaction_context.viewing_keys.entry(viewing_key);
    }

    // we apply all transactions to the transaction context
    for transaction in transactions {
        // mutates transaction_context by inserting spent notes ffrom the transaction
        transaction_context.insert_spent_notes(&transaction);

        // TODO see how to handle a possible failure
        let _result =
            apply_transaction_to_transaction_context(transaction, &mut transaction_context);
        // transaction_context.spent_funds.insert(aaa);
    }

    transaction_context
}

// This does a couple of things for now:
// 1. loops through shielded outputs in transction from that try to decrypt Note by
//    using viewing keys from transaction context
// 2. then we insert note_position to transaction_context.spent_funds
//    to render the target note unusable
fn apply_transaction_to_transaction_context(
    transaction: Transaction,
    transaction_context: &mut TransactionContext,
) -> Result<usize, ()> {
    // transaction has shielded outputs, they are 4.5 Output Descriptions in zcash paper
    // An Output transfer is encoded in transactions as an Output description
    for shielded_output in &(*transaction).shielded_outputs {
        // merkle tree node from Output transfer
        let node = Node::new(shielded_output.cmu.to_repr());

        // we append node to witness map elements
        for witness_map_element in transaction_context.witness_map.iter_mut() {
            let (_, witness) = witness_map_element;
            witness.append(node)?;
        }

        // we need the note position for inserting the witness to witness map
        let note_position = transaction_context.commitment_tree.size();

        // errors is the tree is full
        transaction_context.commitment_tree.append(node)?;

        let witness = IncrementalWitness::<Node>::from_tree(&transaction_context.commitment_tree);
        transaction_context
            .witness_map
            .insert(note_position, witness);

        // checking out if any of the viewing keys can decrypt current note. In case we find one,
        // we add note, memo, payment address and nullifier to their maps in the transaction context.
        // the position is at the end of the map as checkout out earlier as note_position
        for viewing_key_with_notes in transaction_context.viewing_keys.iter_mut() {
            let (viewing_key, notes) = viewing_key_with_notes;

            // attempting to decrypt with viewing_key.ivk (incoming viewing key)
            // this is described at https://zips.z.cash/protocol/protocol.pdf#ivk
            let maybe_decrypted_note = try_sapling_note_decryption::<TestNetwork>(
                0,
                &viewing_key.ivk().0,
                &shielded_output.ephemeral_key.into_subgroup().unwrap(),
                &shielded_output.cmu,
                &shielded_output.enc_ciphertext,
            );

            // so if we have data we insert note, memo, payment_address.diversifier and nullifier
            // to their maps in transaction_context
            if let Some((note, payment_address, memo)) = maybe_decrypted_note {
                // Add this note to list of notes decrypted by this viewing key
                notes.insert(note_position);
                let nullifier = note.nf(viewing_key, note_position.try_into().unwrap());
                transaction_context.note_map.insert(note_position, note);
                transaction_context.memo_map.insert(note_position, memo);
                transaction_context
                    .diversifier_map
                    .insert(note_position, *payment_address.diversifier());
                transaction_context
                    .nullifier_map
                    .insert(nullifier.0.try_into().unwrap(), note_position);
                break;
            }
        }
    }

    for spend_description in &(*transaction).shielded_spends {
        // If the shielded spend's nullifier is in our map, then target note
        // is rendered unusable
        if let Some(note_position) = transaction_context
            .nullifier_map
            .get(&spend_description.nullifier)
        {
            transaction_context.spent_funds.insert(*note_position);
        }
    }

    Ok(transaction_context.commitment_tree.size())
}

impl TransactionContext {
    // inserts the spent notes from the transaction
    fn insert_spent_notes(self: &mut TransactionContext, transaction: &Transaction) {
        for shielded_spend in &(*transaction).shielded_spends {
            if let Some(note_position) = self.nullifier_map.get(&shielded_spend.nullifier) {
                self.spent_funds.insert(*note_position);
            }
        }
    }
}

// #[wasm_bindgen]
// pub fn decode_transaction_with_next_tx_id_2(transfer_as_byte_array: &[u8]) -> NodeWithNextId {
//     let transaction_with_transaction_with_next_tx_id_result =
//         TransactionWithPointerToNext::try_from_slice(transfer_as_byte_array);

//     // unwrap or return
//     let transaction_with_next_tx_id = match transaction_with_transaction_with_next_tx_id_result {
//         Ok(transaction_with_next_tx_id) => transaction_with_next_tx_id,
//         Err(_error) => {
//             // so it was not (Transaction, Option<TxId>)
//             // lets see if it is TxId
//             let next_tx_id_result = TxId::try_from_slice(transfer_as_byte_array);
//             let next_tx_id = match next_tx_id_result {
//                 Ok(next_tx_id_optional) => next_tx_id_optional,
//                 Err(_error) => {
//                     return NodeWithNextId {
//                         node: None,
//                         next_transaction_id: None,
//                     }
//                 }
//             };

//             // turn to string and return
//             return NodeWithNextId {
//                 node: None,
//                 next_transaction_id: Some(next_tx_id.to_string()),
//             };
//         }
//     };

//     // get the next_tx_id
//     let next_tx_id = match &transaction_with_next_tx_id {
//         (_transaction, Some(next_tx_id)) => next_tx_id,
//         (_transaction, None) => {
//             return NodeWithNextId {
//                 node: None,
//                 next_transaction_id: None,
//             }
//         }
//     };

//     return NodeWithNextId {
//         node: Some(transaction_with_next_tx_id.try_to_vec().unwrap()),
//         next_transaction_id: Some(next_tx_id.to_string()),
//     };
// }

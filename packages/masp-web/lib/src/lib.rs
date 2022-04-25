mod shielded_transaction;
mod utils;

use borsh::{BorshDeserialize, BorshSerialize};
use ff::PrimeField;
use group::cofactor::CofactorGroup;

use anoma::types::address::Address;
use jubjub;
use masp_primitives::asset_type::AssetType;
use masp_primitives::consensus::{BranchId, TestNetwork};
use masp_primitives::keys::ExpandedSpendingKey;
use masp_primitives::note_encryption::{try_sapling_note_decryption, Memo};
use masp_primitives::primitives::{Diversifier, PaymentAddress, ViewingKey};
use masp_primitives::sapling::Node;
use masp_primitives::transaction::builder::Builder as Builder2;
use masp_primitives::transaction::{
    builder::{self, *},
    components::Amount,
    Transaction, TransactionData, TxId,
};
use masp_primitives::zip32::{ExtendedFullViewingKey, ExtendedSpendingKey};
use masp_proofs::prover::LocalTxProver;
use rand_core::{CryptoRng, OsRng, RngCore};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen;
use shielded_transaction::{compose_shielded_transaction, TransactionContext};
use std::collections::HashSet;
use std::convert::{TryFrom, TryInto};
use utils::{console_log, console_log_any};
use wasm_bindgen::prelude::*;
use zcash_primitives::merkle_tree::IncrementalWitness;

use std::str::{self, FromStr};

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

type TransactionWithPointerToNext = (Transaction, Option<TxId>);

// utils
pub fn to_viewing_key(esk: &ExtendedSpendingKey) -> ViewingKey {
    ExtendedFullViewingKey::from(esk).fvk.vk
}

pub fn find_valid_diversifier<R: RngCore + CryptoRng>(
    rng: &mut R,
) -> (Diversifier, jubjub::SubgroupPoint) {
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
pub fn perform_shielded_transaction(
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    payment_address_as_string: String,
    amount: u64,
    spend_param_bytes: &[u8],
    output_param_bytes: &[u8],
) -> Option<Vec<u8>> {
    // we create these from the string values that the user passed in
    let payment_address_result = PaymentAddress::from_str(payment_address_as_string.as_str());
    let payment_address = match payment_address_result {
        Ok(payment_address) => payment_address,
        Err(error) => {
            return None;
        }
    };
    let spending_key_result = ExtendedSpendingKey::from_str("AAA003");
    let spending_key = match spending_key_result {
        Ok(spending_key) => spending_key,
        Err(_) => return None,
    };

    // we transform the data to Transactions
    let transactions_maybe = nodes_with_next_id_to_transactions(shielded_transactions);
    let transactions = match transactions_maybe {
        Some(transactions) => transactions,
        None => return None,
    };

    // now using the transactions we create the transaction context
    let transaction_context =
        load_shielded_transaction_context(transactions, vec![spending_key], vec![]);
    // some details we need for the builder
    let height = 0u32;
    let consensus_branch_id = BranchId::Sapling;
    let amt: u64 = amount;
    let memo: Option<Memo> = None;

    let mut builder = Builder2::<TestNetwork, OsRng>::new(height);

    // TOKEN
    // this is BTC address
    let token_type_result = Address::decode(
        "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp",
    );
    let token_type = match token_type_result {
        Ok(token_type) => token_type,
        Err(error) => {
            return None;
        }
    };
    let token_bytes = token_type.try_to_vec().expect("token should serialize");
    let asset_type = AssetType::new(token_bytes.as_ref()).expect("unable to create asset type");

    // Transaction fees will be taken care of in the wrapper Transfer
    builder.set_fee(Amount::zero());
    let is_shielded = true;
    if is_shielded {
        let mut val_acc = 0;
        // Retrieve the notes that can be spent by this key
        if let Some(avail_notes) = transaction_context
            .viewing_keys
            .get(&to_viewing_key(&spending_key))
        {
            for note_idx in avail_notes {
                // No more transaction inputs are required once we have met
                // the target amount
                if val_acc >= amt {
                    break;
                }
                // Spent notes cannot contribute a new transaction's pool
                if transaction_context.spent_funds.contains(note_idx) {
                    continue;
                }
                // Get note, merkle path, diversifier associated with this ID
                let note = transaction_context.note_map.get(note_idx).unwrap().clone();
                // Note with distinct asset type cannot be used as input to this
                // transaction
                if note.asset_type != asset_type {
                    continue;
                }
                let merkle_path = transaction_context
                    .witness_map
                    .get(note_idx)
                    .unwrap()
                    .path()
                    .unwrap();
                let diversifier = transaction_context.diversifier_map.get(note_idx).unwrap();
                val_acc += note.value;
                // Commit this note to our transaction
                builder.add_sapling_spend(spending_key.clone(), *diversifier, note, merkle_path);
            }
        }
        // If there is change leftover send it back to this spending key
        if val_acc > amt {
            let vk = spending_key.expsk.proof_generation_key().to_viewing_key();

            let change_pa = vk
                .to_payment_address(find_valid_diversifier(&mut OsRng).0)
                .unwrap();

            let change_amt = val_acc - amt;
            let _ = builder.add_sapling_output(
                Some(spending_key.expsk.ovk),
                change_pa.clone(),
                asset_type,
                change_amt,
                None,
            );
        }
    }
    let local_prover = LocalTxProver::from_bytes(&spend_param_bytes, &output_param_bytes);
    let transaction_result = builder
        .build(consensus_branch_id, &local_prover)
        .map(|x| Some(x));
    console_log("perform_shielded_transaction 20");
    match transaction_result {
        Ok(transaction_maybe) => {
            if let Some((transaction, transaction_metadata)) = transaction_maybe {
                console_log_any(&transaction);
                return Some(transaction.try_to_vec().unwrap());
            }
            return None;
        }
        Err(error) => {
            console_log_any(&error.to_string());
            return None;
        }
    };
}

fn nodes_with_next_id_to_transactions(shielded_transactions: JsValue) -> Option<Vec<Transaction>> {
    let shielded_transactions_result =
        serde_wasm_bindgen::from_value::<Vec<NodeWithNextId>>(shielded_transactions);

    let shielded_transactions = match shielded_transactions_result {
        Ok(shielded_transactions) => shielded_transactions,
        Err(_) => return None,
    };

    // construct transactions
    let mut transactions: Vec<Transaction> = vec![];

    for shielded_transaction_with_next_id in shielded_transactions {
        if let Some(node) = shielded_transaction_with_next_id.node {
            let transaction_result = Transaction::try_from_slice(&node);
            if let Ok(transaction) = transaction_result {
                transactions.push(transaction);
            } else {
            };
        } else {
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

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct NodeWithNextId {
    node: Option<Vec<u8>>,
    next_transaction_id: Option<String>,
}

#[wasm_bindgen]
impl NodeWithNextId {
    // this takes the byte array that ts code fetched
    // It should return it as JsValue, that packs Transaction as borsh serialised byte array
    // and the transaction id of the next linked transaction
    // from
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
            // The byte array could have countained also just an id of the next transaction
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
        let viewing_key = extended_spending_key_to_viewing_key(&spending_key);

        transaction_context
            .viewing_keys
            .entry(viewing_key.into())
            .or_insert(HashSet::new());
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

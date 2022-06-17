use super::transaction_context::TransactionContext;
use super::transaction_with_next_id::NodeWithNextId;
use super::utils::{console_log, console_log_any};
use anoma::types::address::Address;
use anoma::types::masp::TransferTarget;
use borsh::{BorshDeserialize, BorshSerialize};
use ff::PrimeField;
use group::cofactor::CofactorGroup;
use jubjub;
use masp_primitives::asset_type::AssetType;
use masp_primitives::consensus::{BranchId, TestNetwork};
use masp_primitives::legacy::TransparentAddress;
use masp_primitives::note_encryption::{try_sapling_note_decryption, Memo};
use masp_primitives::primitives::{Diversifier, PaymentAddress, ViewingKey};
use masp_primitives::sapling::Node;
use masp_primitives::transaction::builder::{
    ripemd160, ripemd160::Digest, secp256k1, Builder as Builder2,
};
use masp_primitives::transaction::{
    components::{Amount, OutPoint, TxOut},
    Transaction,
};
use masp_primitives::zip32::{ExtendedFullViewingKey, ExtendedSpendingKey};
use masp_proofs::prover::LocalTxProver;
use rand_core::{CryptoRng, OsRng, RngCore};
use serde_wasm_bindgen;
use std::collections::HashSet;
use std::convert::TryInto;
use std::str::FromStr;
use wasm_bindgen::prelude::*;
use zcash_primitives::merkle_tree::IncrementalWitness;

// this is the top level function when creating shielded transactions
// it does the following:
// - turns spending_key_as_string and payment_address_as_string to objects
// - decrypts the past transactions and reverses their order
// - creates an object for AssetType
// - loops through past transactions seeking for notes that can be decrypted and still spent with the current spending key
// - creates a possible needed return payment for the source of the transfer
// -
pub fn create_shielded_transfer(
    // they should be passed in order that they were fetched starting from head-tx as they are reversed here
    shielded_transactions: JsValue,
    spending_key_as_string: Option<String>,
    payment_address_as_string: String,
    token_address: String,
    amount: u64,
    spend_param_bytes: &[u8],
    output_param_bytes: &[u8],
) -> Option<Vec<u8>> {
    // turning the string parameters to correct types
    // spending key, could also be transparent address if we are doing transparent -> shielded transfer
    let spending_key_maybe = if spending_key_as_string.is_none() {
        None
    } else {
        let spending_key_result =
            ExtendedSpendingKey::from_str(&spending_key_as_string.as_ref().unwrap().as_str());
        let spending_key = match spending_key_result {
            Ok(spending_key) => Some(spending_key),
            Err(_error) => {
                // TODO replace this placeholder check that we really have a transparent address
                // the check is dine even done before this func is called
                if !spending_key_as_string.unwrap().starts_with("atest") {
                    return None;
                };
                None
            }
        };
        spending_key
    };

    // payment address
    let payment_address_result = PaymentAddress::from_str(&payment_address_as_string.as_str());
    let payment_address = match payment_address_result {
        Ok(payment_address) => payment_address,
        Err(_error) => {
            console_log("payment_address_as_string is not payment address");
            console_log(payment_address_as_string.as_str());
            return None;
        }
    };

    // transactions
    let transactions_maybe = nodes_with_next_id_to_transactions(shielded_transactions);
    let mut transactions = match transactions_maybe {
        Some(transactions) => transactions,
        None => return None,
    };
    // the order where the transactions were fetched stating from head-tx
    // it would be good to check this out using the head-tx
    transactions.reverse();

    // asset type
    let token_address_result = Address::decode(token_address);
    let token_address = match token_address_result {
        Ok(token_type) => token_type,
        Err(_error) => {
            return None;
        }
    };
    let token_bytes = token_address.try_to_vec().expect("token should serialize");
    let asset_type = AssetType::new(token_bytes.as_ref()).expect("unable to create asset type");

    // then we prepare some data for the builder
    // TODO just setting this to 0 seem to be fine for now but should put the real number
    let height = 0u32;
    let consensus_branch_id = BranchId::Sapling;
    let memo: Option<Memo> = None;

    // We initiate the builder
    let mut builder = Builder2::<TestNetwork, OsRng>::new(height);

    // Transaction fees will be taken care of in the wrapper Transfer
    let _ = builder.set_fee(Amount::zero());

    // We will need to cope with cases of:
    // transparent -> shielded
    // shielded -> shielded
    // shielded -> transparent

    // either spending_key has a value and we have a shielded input
    // or it's None and the input is transparent address
    if let Some(spending_key) = spending_key_maybe {
        // we create this context that holds the data that will be needed later, it contains:
        // notes, spent notes, ...
        let transaction_context =
            load_shielded_transaction_context(transactions, vec![spending_key], vec![]);
        let mut accumulated_amount = 0;
        let lookup_viewing_key = extended_spending_key_to_viewing_key(&spending_key);

        // Retrieve the notes that can be spent by this key
        if let Some(avail_notes) = transaction_context.viewing_keys.get(&lookup_viewing_key) {
            accumulated_amount = gather_spend_from_notes(
                avail_notes,
                amount,
                asset_type,
                &transaction_context,
                spending_key,
                &mut builder,
            );
        }

        // If there is change leftover send it back to this spending key
        if accumulated_amount > amount {
            let viewing_key = spending_key.expsk.proof_generation_key().to_viewing_key();
            let change_pa = viewing_key
                .to_payment_address(find_valid_diversifier(&mut OsRng).0)
                .unwrap();

            let change_amt = accumulated_amount - amount;
            let _ = builder.add_sapling_output(
                Some(spending_key.expsk.ovk),
                change_pa.clone(),
                asset_type,
                change_amt,
                None,
            );
        }
    } else {
        let secp_sk = secp256k1::SecretKey::from_slice(&[0xcd; 32]).expect("secret key");
        let secp_ctx = secp256k1::Secp256k1::<secp256k1::SignOnly>::gen_new();
        let secp_pk = secp256k1::PublicKey::from_secret_key(&secp_ctx, &secp_sk).serialize();
        let hash = ripemd160::Ripemd160::digest(&sha2::Sha256::digest(&secp_pk));
        let script = TransparentAddress::PublicKey(hash.into()).script();
        let _adding_transparent_input_result = builder.add_transparent_input(
            secp_sk,
            OutPoint::new([0u8; 32], 0),
            TxOut {
                asset_type,
                value: amount,
                script_pubkey: script,
            },
        );
        let _ = builder.add_sapling_output(
            None,
            payment_address.into(),
            asset_type,
            amount,
            memo.clone(),
        );
    }

    // shielded output
    if let Some(_spending_key) = spending_key_maybe {
        let _ = builder.add_sapling_output(None, payment_address.into(), asset_type, amount, memo);
    } else if false {
        console_log("it is transparent target");
        // add transparent target
        let address = Address::from_str(payment_address_as_string.as_str());
        let transfer_target = TransferTarget::Address(address.unwrap()); // TODO handle failure case
                                                                         // let target = ctx.get(&args.target);
        let transfer_target_encoded = transfer_target
            .address()
            .expect("target address should be transparent")
            .try_to_vec()
            .expect("target address encoding");
        let hash =
            ripemd160::Ripemd160::digest(&sha2::Sha256::digest(transfer_target_encoded.as_ref()));

        let _ = builder.add_transparent_output(
            &TransparentAddress::PublicKey(hash.into()),
            asset_type,
            amount,
        );
    }

    // we constructed the prover from the files that were passed to this func
    let local_prover = LocalTxProver::from_bytes(&spend_param_bytes, &output_param_bytes);

    // will add a spinner or some notification for the user to know that it has not crashed
    console_log("building the transaction, just wait, this can take around 1 min");

    // Finally we use the builder to create the transaction
    let transaction_result = builder
        .build(consensus_branch_id, &local_prover)
        .map(|x| Some(x));

    // and we return the transaction encoded so we can ettach it to the shielded field of a
    // transfer and broadcast to the ledfer
    match transaction_result {
        Ok(transaction_maybe) => {
            if let Some((transaction, _transaction_metadata)) = transaction_maybe {
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

pub fn get_shielded_balance(
    // they should be passed in order that they were fetched starting from head-tx as they are reversed here
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    token_address: String,
) -> Option<u64> {
    // turning the string parameters to correct types
    // spending key, could also be transparent address if we are doing transparent -> shielded transfer
    let spending_key_result = ExtendedSpendingKey::from_str(spending_key_as_string.as_str());
    let spending_key_maybe = match spending_key_result {
        Ok(spending_key) => Some(spending_key),
        Err(_error) => {
            // TODO replace this placeholder check that we really have a transparent address
            // the check is fine even done before this func is called
            if !spending_key_as_string.starts_with("atest") {
                return None;
            };
            None
        }
    };

    // transactions
    let transactions_maybe = nodes_with_next_id_to_transactions(shielded_transactions);
    let mut transactions = match transactions_maybe {
        Some(transactions) => transactions,
        None => return None,
    };

    // the order where the transactions were fetched stating from head-tx
    // it would be good to check this out using the head-tx
    transactions.reverse();

    // asset type
    let token_address_result = Address::decode(token_address);
    let token_address = match token_address_result {
        Ok(token_type) => token_type,
        Err(_error) => {
            return None;
        }
    };
    let token_bytes = token_address.try_to_vec().expect("token should serialize");
    let asset_type = AssetType::new(token_bytes.as_ref()).expect("unable to create asset type");

    // TODO can this be optional in ::Builder::new as we do not need it here
    let height = 0u32;

    // We initiate the builder
    let mut builder = Builder2::<TestNetwork, OsRng>::new(height);

    // Transaction fees will be taken care of in the wrapper Transfer
    let _ = builder.set_fee(Amount::zero());

    if let Some(spending_key) = spending_key_maybe {
        // we create this context that holds the data that will be needed later, it contains:
        // notes, spent notes, ...
        let transaction_context =
            load_shielded_transaction_context(transactions, vec![spending_key], vec![]);
        let lookup_viewing_key = extended_spending_key_to_viewing_key(&spending_key);

        // Retrieve the notes that can be spent by this key
        if let Some(avail_notes) = transaction_context.viewing_keys.get(&lookup_viewing_key) {
            let total_amount = gather_all_unspent_notes_of_viewing_key(
                avail_notes,
                asset_type,
                &transaction_context,
                spending_key,
                &mut builder,
            );
            return Some(total_amount);
        }
    }
    None
}

// "collects" unspent notes that are available for the current spending key
fn gather_all_unspent_notes_of_viewing_key(
    avail_notes: &HashSet<usize>,
    asset_type: AssetType,
    transaction_context: &TransactionContext,
    spending_key: ExtendedSpendingKey,
    builder: &mut Builder2<TestNetwork, OsRng>,
) -> u64 {
    let mut val_acc = 0;
    for note_idx in avail_notes {
        // if this note is spent we just continue
        if transaction_context.spent_funds.contains(note_idx) {
            continue;
        }

        // lets get the note from the context that we constructed earlier
        let note = transaction_context.note_map.get(note_idx).unwrap().clone();

        // if this note is for wrong any different asset type we continue
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
        let _add_sapling_spend_result =
            builder.add_sapling_spend(spending_key.clone(), *diversifier, note, merkle_path);
    }
    val_acc
}

fn gather_spend_from_notes(
    avail_notes: &HashSet<usize>,
    amount: u64,
    asset_type: AssetType,
    transaction_context: &TransactionContext,
    spending_key: ExtendedSpendingKey,
    builder: &mut Builder2<TestNetwork, OsRng>,
) -> u64 {
    let mut val_acc = 0;
    for note_idx in avail_notes {
        // once we meet the target amount we can stop collecting unspent notes
        if val_acc >= amount {
            break;
        }

        // if this note is spent we just continue
        if transaction_context.spent_funds.contains(note_idx) {
            continue;
        }

        // lets get the note from the context that we constructed earlier
        let note = transaction_context.note_map.get(note_idx).unwrap().clone();

        // if this note is for wrong any different asset type we continue
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
        let _add_sapling_spend_result =
            builder.add_sapling_spend(spending_key.clone(), *diversifier, note, merkle_path);
    }
    val_acc
}

// this util func turns an encoded Vec<NodeWithNextIds> to Vec<Transaction>
// this is needed when we start to generate the shielded transaction and javascript passes in
// the encoded Vec<NodeWithNextIds>
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

// a util, turning an extended spending key ( look at 3.1 zcash paper) to viewing key ( look at 3.1 zcash paper)
fn extended_spending_key_to_viewing_key(extended_spending_key: &ExtendedSpendingKey) -> ViewingKey {
    ExtendedFullViewingKey::from(extended_spending_key).fvk.vk
}

// creates the shielded transactions context
// this contains all the existing shielded transactions from the pool
// this is just a util for now, based on code from Marusi's implementation
fn load_shielded_transaction_context(
    transactions: Vec<Transaction>, // the fetched transactions of the pool
    spending_keys: Vec<ExtendedSpendingKey>, // spending keys where the funds will come from
    viewing_keys: Vec<ViewingKey>,  // not used for now
) -> TransactionContext {
    // we initiate it
    let mut transaction_context = TransactionContext::default();

    // we add spending keys with an empty HashSet under the viewing_keys
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

    // we want to persist the locations of all spent notes
    // so we loop through the transactions
    for transaction in transactions {
        // mutates transaction_context by inserting spent notes from the transaction

        // in apply_transaction_to_transaction_context we try to
        // decrypt the notes with the viewing key and add them to the HashMap
        // in the context
        let _result =
            apply_transaction_to_transaction_context(transaction.clone(), &mut transaction_context);

        // transaction_context.insert_spent_notes(&transaction);
    }

    transaction_context
}

// This does a couple of things for now:
// 1. loops through shielded outputs in transaction from that try to decrypt Note by
//    using viewing keys from transaction context
// 2. then we insert note_position to transaction_context.spent_funds
//    to render the target note unusable
fn apply_transaction_to_transaction_context(
    transaction: Transaction,
    transaction_context: &mut TransactionContext,
) -> Result<usize, ()> {
    // transaction has shielded outputs, they are 4.5 Output Descriptions in zcash paper
    // spent note is encoded in transactions as an OutputDescription
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

        // errors if the tree is full
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
                // Compute the nullifier now to quickly recognize when spent
                let nullifier = note.nf(viewing_key, note_position.try_into().unwrap());

                // using note_position as a key
                transaction_context.note_map.insert(note_position, note);
                transaction_context.memo_map.insert(note_position, memo);
                transaction_context
                    .diversifier_map
                    .insert(note_position, *payment_address.diversifier());

                // let nullifier_of_current_note = nullifier.0.try_into().unwrap();
                let nullifier_of_current_note = nullifier.0;
                transaction_context
                    .nullifier_map
                    .insert(nullifier_of_current_note, note_position);
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

fn find_valid_diversifier<R: RngCore + CryptoRng>(
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

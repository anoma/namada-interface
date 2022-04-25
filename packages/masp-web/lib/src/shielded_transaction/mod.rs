mod shielded_transfer;
mod transaction_context;

use masp_primitives::primitives::{Diversifier, Note, ViewingKey};
use std::collections::{HashMap, HashSet};
pub use transaction_context::TransactionContext;
use zcash_primitives::merkle_tree::{CommitmentTree, IncrementalWitness};

pub fn compose_shielded_transaction(spending_key: String, payment_address: String, amount: u64) {
    // check that we have a spending_key
    // check that we have a payment_address
    //
    let shielded_context = load_shielded_context();
    //
    let height = 0u32;
    // let consensus_branch_id = BranchId::Sapling;
    // let memo: Option<Memo> = None;
    // let token_as_bytes
    // let asset_type
    //
    // set fee
    //
    //
    let spendable_notes = get_spendable_notes();
    //
    //
    let spent_notes = spend_notes();
    //
    //
    return_change();
    //
    //
    // let outgoing_view_key;
    add_sapling_output();

    let shielded_transaction = create_shielded_transaction();
    shielded_transaction
}

// this creates the pool from the point of view of the viewing key
fn load_shielded_context() {
    let transaction_context = TransactionContext::init_from_spending_key();
}

// this creates the pool from the point of view of the viewing key
fn get_spendable_notes() {
    // 1.
}

// this creates the pool from the point of view of the viewing key
fn spend_notes() {
    // 1.
}

// this creates the pool from the point of view of the viewing key
fn return_change() {
    // 1.
}

// aaa
fn add_sapling_output() {}

// aaa
fn create_shielded_transaction() {}

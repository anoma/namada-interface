use masp_primitives::note_encryption::Memo;
use masp_primitives::primitives::{Diversifier, Note, ViewingKey};
use masp_primitives::sapling::Node;
use std::collections::{HashMap, HashSet};
use zcash_primitives::merkle_tree::{CommitmentTree, IncrementalWitness};

pub struct TransactionContext {
    pub commitment_tree: CommitmentTree<Node>,
    pub viewing_keys: HashMap<ViewingKey, HashSet<usize>>,
    pub nullifier_map: HashMap<[u8; 32], usize>, // Transaction.shielded_spends maps to this
    pub spent_funds: HashSet<usize>, // lists spent funds locations based on nullifier_map
    pub note_map: HashMap<usize, Note>,
    pub memo_map: HashMap<usize, Memo>,
    pub diversifier_map: HashMap<usize, Diversifier>,
    pub witness_map: HashMap<usize, IncrementalWitness<Node>>,
}

// based on spending key we get all the
// likely best to do this in ts side as we are doing all the networking there now
// can call ts func from here
fn fetch_shielded_transactions_by_spending_keys(spending_key: Vec<String>) -> Vec<String> {
    // 1. perform an RPC call to fetch the shielded transactions
    //    using masp address
    // 2. loop through linked list as long as there are items
    // 3. return the list in reversed order
    vec![String::from("transaction_1_placeholder")]
}

// based on set of shielded transactions we create a tx context
fn create_transaction_context_from_transactions(transactions: Vec<String>) -> TransactionContext {
    TransactionContext::default()
}

impl TransactionContext {
    // delete this
    pub fn init_from_spending_key() -> Self {
        // create the shielded transactions context
        let viewing_keys = vec!["placeholder".to_string()];
        let shielded_transactions = fetch_shielded_transactions_by_spending_keys(viewing_keys);
        let transaction_context =
            create_transaction_context_from_transactions(shielded_transactions);

        // additional data
        let height = String::from("height");
        let consensus_branch_id = String::from("consensus_branch_id");
        let amt = String::from("amt");
        let memo = String::from("memo");

        transaction_context
    }

    // this is for
    pub fn update_witness_map(&mut self) {
        // 1 task
        // 2 task
        // 3 task
    }
}

impl Default for TransactionContext {
    fn default() -> TransactionContext {
        TransactionContext {
            commitment_tree: CommitmentTree::empty(),
            viewing_keys: HashMap::default(),
            nullifier_map: HashMap::default(),
            note_map: HashMap::default(),
            memo_map: HashMap::default(),
            diversifier_map: HashMap::default(),
            witness_map: HashMap::default(),
            spent_funds: HashSet::default(),
        }
    }
}

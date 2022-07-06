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

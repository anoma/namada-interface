use namada_sdk::borsh::BorshSerialize;
use serde::{Deserialize, Serialize};

#[derive(BorshSerialize)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct ProposalInfo {
    pub id: u64,
    pub content: String,
    pub author: String,
    pub start_epoch: u64,
    pub end_epoch: u64,
    pub grace_epoch: u64,
    pub tally_type: String,
    pub proposal_type: String,
    pub data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct WasmHash {
    path: String,
    hash: String,
}

impl WasmHash {
    pub fn new(path: String, hash: String) -> WasmHash {
        WasmHash { path, hash }
    }

    pub fn path(&self) -> String {
        self.path.clone()
    }

    pub fn hash(&self) -> String {
        self.hash.clone()
    }
}

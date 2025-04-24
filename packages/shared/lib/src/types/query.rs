use namada_sdk::address::Address;
use namada_sdk::borsh::BorshSerialize;
use namada_sdk::dec::Dec;
use namada_sdk::uint::Uint;
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
pub struct MaspTokenRewardData {
    pub name: String,
    pub address: Address,
    pub max_reward_rate: Dec,
    pub kp_gain: Dec,
    pub kd_gain: Dec,
    pub locked_amount_target: Uint,
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

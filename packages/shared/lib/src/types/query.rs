use namada::core::borsh::BorshSerialize;

#[derive(BorshSerialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct ProposalInfo {
    pub id: u64,
    pub content: String,
    pub author: String,
    pub start_epoch: u64,
    pub end_epoch: u64,
    pub grace_epoch: u64,
}

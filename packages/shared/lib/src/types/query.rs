use borsh::BorshSerialize;

#[derive(BorshSerialize)]
pub struct ProposalInfo {
    pub id: String,
    pub proposal_type: String,
    pub author: String,
    pub start_epoch: u64,
    pub end_epoch: u64,
    pub grace_epoch: u64,
    pub content: String,
    pub status: String,
    pub result: String,
    pub total_voting_power: String,
    pub total_yay_power: String,
    pub total_nay_power: String,
}

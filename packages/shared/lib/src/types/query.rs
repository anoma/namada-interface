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
    pub yes_votes: Option<String>,
    pub total_voting_power: Option<String>,
    pub result: Option<String>,
}

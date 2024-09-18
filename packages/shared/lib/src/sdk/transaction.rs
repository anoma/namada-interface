use namada_sdk::borsh::BorshSerializeExt;
use namada_sdk::token::Transfer;
use serde::Serialize;

use namada_sdk::governance::VoteProposalData;
use namada_sdk::tx::data::pos::{Bond, ClaimRewards, Redelegation, Unbond, Withdraw};
use namada_sdk::{
    borsh::{self, BorshDeserialize},
    key::common::PublicKey,
};
use wasm_bindgen::JsError;

use crate::sdk::{
    args::{
        BondMsg, ClaimRewardsMsg, RedelegateMsg, RevealPkMsg, TransferDataMsg, TransferMsg,
        UnbondMsg, VoteProposalMsg, WithdrawMsg,
    },
    tx::TxType,
};

#[derive(Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum TransactionKind {
    Transfer(Transfer),
    Bond(Bond),
    Redelegation(Redelegation),
    Unbond(Unbond),
    Withdraw(Withdraw),
    ProposalVote(VoteProposalData),
    ClaimRewards(ClaimRewards),
    RevealPk(PublicKey),
    Unknown,
}

impl TransactionKind {
    pub fn from(tx_type: TxType, data: &[u8]) -> Self {
        match tx_type {
            TxType::Transfer => TransactionKind::Transfer(
                Transfer::try_from_slice(data).expect("Cannot deserialize TransparentTransfer"),
            ),
            TxType::Bond => {
                TransactionKind::Bond(Bond::try_from_slice(data).expect("Cannot deserialize Bond"))
            }
            TxType::Redelegate => TransactionKind::Redelegation(
                Redelegation::try_from_slice(data).expect("Cannot deserialize Redelegation"),
            ),
            TxType::Unbond => TransactionKind::Unbond(
                Unbond::try_from_slice(data).expect("Cannot deserialize Unbond"),
            ),
            TxType::Withdraw => TransactionKind::Withdraw(
                Withdraw::try_from_slice(data).expect("Cannot deserialize Withdraw"),
            ),
            TxType::VoteProposal => TransactionKind::ProposalVote(
                VoteProposalData::try_from_slice(data).expect("Cannot deserialize VoteProposal"),
            ),
            TxType::ClaimRewards => TransactionKind::ClaimRewards(
                ClaimRewards::try_from_slice(data).expect("Cannot deserialize ClaimRewards"),
            ),
            TxType::RevealPK => TransactionKind::RevealPk(
                PublicKey::try_from_slice(data).expect("Cannot deserialize PublicKey"),
            ),
            _ => TransactionKind::Unknown,
        }
    }

    // Returns vec of borsh-serialized arguments bytes based on transaction type
    pub fn to_bytes(&self) -> Result<Vec<u8>, JsError> {
        let bytes: Vec<u8> = match self {
            TransactionKind::Bond(bond) => {
                let Bond {
                    amount,
                    validator,
                    source,
                } = bond;

                if !source.is_some() {
                    return Err(JsError::new("Bond source must be defined!"));
                }

                let bond = BondMsg::new(
                    source.clone().unwrap().to_string(),
                    validator.to_string(),
                    amount.native_denominated().to_string(),
                );
                borsh::to_vec(&bond)?
            }
            TransactionKind::Unbond(unbond) => {
                let Unbond {
                    amount,
                    validator,
                    source,
                } = unbond;

                if !source.is_some() {
                    return Err(JsError::new("Unbond source must be defined!"));
                }

                let unbond = UnbondMsg::new(
                    source.clone().unwrap().to_string(),
                    validator.to_string(),
                    amount.native_denominated().to_string(),
                );
                borsh::to_vec(&unbond)?
            }
            TransactionKind::Withdraw(withdraw) => {
                let Withdraw { validator, source } = withdraw;

                if !source.is_some() {
                    return Err(JsError::new("Withdraw source must be defined!"));
                }

                let withdraw =
                    WithdrawMsg::new(source.clone().unwrap().to_string(), validator.to_string());
                borsh::to_vec(&withdraw)?
            }
            TransactionKind::Redelegation(redelegation) => {
                let Redelegation {
                    owner,
                    src_validator,
                    dest_validator,
                    amount,
                } = redelegation;

                let redelegation = RedelegateMsg::new(
                    owner.to_string(),
                    src_validator.to_string(),
                    dest_validator.to_string(),
                    amount.native_denominated().to_string(),
                );
                borsh::to_vec(&redelegation)?
            }
            TransactionKind::RevealPk(public_key) => {
                let reveal_pk = RevealPkMsg::new(public_key.to_string());
                borsh::to_vec(&reveal_pk)?
            }
            TransactionKind::Transfer(transfer) => {
                let Transfer {
                    sources,
                    targets,
                    shielded_section_hash,
                } = transfer;

                let ssh = match shielded_section_hash {
                    Some(masp_tx_id) => {
                        // Serialize and return bytes
                        let bytes = masp_tx_id.serialize_to_vec();
                        Some(bytes)
                    }
                    None => None,
                };

                let mut sources_data: Vec<TransferDataMsg> = vec![];
                let mut targets_data: Vec<TransferDataMsg> = vec![];

                for (source, amount) in sources {
                    let owner = source.owner.to_string();
                    let token = source.token.to_string();
                    let amount = amount.amount().native_denominated().to_string();
                    sources_data.push(TransferDataMsg::new(owner, token, amount))
                }

                for (target, amount) in targets {
                    let owner = target.owner.to_string();
                    let token = target.token.to_string();
                    let amount = amount.amount().native_denominated().to_string();
                    targets_data.push(TransferDataMsg::new(owner, token, amount))
                }

                borsh::to_vec(&TransferMsg::new(sources_data, targets_data, ssh))?
            }
            TransactionKind::ProposalVote(vote_proposal) => {
                let VoteProposalData { id, vote, voter } = vote_proposal;
                let vote_proposal = VoteProposalMsg::new(voter.to_string(), *id, vote.to_string());
                borsh::to_vec(&vote_proposal)?
            }
            TransactionKind::ClaimRewards(claim_rewards) => {
                let ClaimRewards { validator, source } = claim_rewards;
                let claim_rewards = ClaimRewardsMsg::new(
                    validator.to_string(),
                    source.clone().map(|addr| addr.to_string()),
                );
                borsh::to_vec(&claim_rewards)?
            }
            _ => panic!("Unsupported Tx provided, cannot serialize"),
        };

        Ok(bytes)
    }
}

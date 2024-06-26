use serde::Serialize;

use namada::governance::VoteProposalData;
use namada::sdk::token::TransparentTransfer;
use namada::tx::data::pos::{Bond, Redelegation, Unbond, Withdraw};
use namada::{core::borsh::BorshDeserialize, key::common::PublicKey};

use crate::sdk::tx::TxType;

#[derive(Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum TransactionKind {
    TransparentTransfer(TransparentTransfer),
    Bond(Bond),
    Redelegation(Redelegation),
    Unbond(Unbond),
    Withdraw(Withdraw),
    ProposalVote(VoteProposalData),
    RevealPk(PublicKey),
    Unknown,
}

impl TransactionKind {
    pub fn to_json(&self) -> String {
        serde_json::to_string(&self).expect("Cannot serialize TransactionKind")
    }

    pub fn from(tx_type: TxType, data: &[u8]) -> Self {
        match tx_type {
            TxType::TransparentTransfer => TransactionKind::TransparentTransfer(
                TransparentTransfer::try_from_slice(data)
                    .expect("Cannot deserialize TransparentTransfer"),
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
            TxType::RevealPK => TransactionKind::RevealPk(
                PublicKey::try_from_slice(data).expect("Cannot deserialize PublicKey"),
            ),
            _ => TransactionKind::Unknown,
        }
    }
}

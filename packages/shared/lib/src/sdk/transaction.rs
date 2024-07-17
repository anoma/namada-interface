use serde::Serialize;

use namada::governance::VoteProposalData;
use namada::sdk::token::Transfer;
use namada::tx::data::pos::{Bond, Redelegation, Unbond, Withdraw};
use namada::{
    core::borsh::{self, BorshDeserialize},
    key::common::PublicKey,
};
use wasm_bindgen::JsError;

use crate::sdk::{
    args::{
        BondMsg, RedelegateMsg, RevealPkMsg, TransparentTransferMsg, UnbondMsg, VoteProposalMsg,
        WithdrawMsg,
    },
    tx::TxType,
};

use super::args::TransparentTransferDataMsg;

#[derive(Serialize, Debug, Clone)]
#[serde(untagged)]
pub enum TransactionKind {
    TransparentTransfer(Transfer),
    Bond(Bond),
    Redelegation(Redelegation),
    Unbond(Unbond),
    Withdraw(Withdraw),
    ProposalVote(VoteProposalData),
    RevealPk(PublicKey),
    Unknown,
}

impl TransactionKind {
    pub fn from(tx_type: TxType, data: &[u8]) -> Self {
        match tx_type {
            TxType::TransparentTransfer => TransactionKind::TransparentTransfer(
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
                    amount.to_string(),
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
                    amount.to_string(),
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
                    amount.to_string(),
                );
                borsh::to_vec(&redelegation)?
            }
            TransactionKind::RevealPk(public_key) => {
                let reveal_pk = RevealPkMsg::new(public_key.to_string());
                borsh::to_vec(&reveal_pk)?
            }
            TransactionKind::TransparentTransfer(transfer) => {
                let Transfer {
                    sources,
                    targets,
                    shielded_section_hash: _,
                } = transfer;

                let mut data: Vec<TransparentTransferDataMsg> = vec![];

                for (i, (source, token)) in sources.into_iter().enumerate() {
                    let (target, amount) = targets.iter().nth(i).unwrap();

                    let transfer = TransparentTransferDataMsg::new(
                        source.owner.to_string(),
                        target.owner.to_string(),
                        token.to_string(),
                        amount.to_string(),
                    );
                    data.push(transfer);
                }

                borsh::to_vec(&TransparentTransferMsg::new(data))?
            }
            TransactionKind::ProposalVote(vote_proposal) => {
                let VoteProposalData { id, vote, voter } = vote_proposal;
                let vote_proposal = VoteProposalMsg::new(voter.to_string(), *id, vote.to_string());
                borsh::to_vec(&vote_proposal)?
            }
            _ => panic!("Unsupported Tx provided, cannot serialize"),
        };

        Ok(bytes)
    }
}

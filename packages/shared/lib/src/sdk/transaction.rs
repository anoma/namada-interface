use namada::token::Transfer;
use serde::Serialize;

use namada::governance::VoteProposalData;
use namada::tx::data::pos::{Bond, Redelegation, Unbond, Withdraw};
use namada::{
    core::borsh::{self, BorshDeserialize},
    key::common::PublicKey,
};
use wasm_bindgen::JsError;

use crate::sdk::{
    args::{
        BondMsg, RedelegateMsg, RevealPkMsg, TransferDataMsg, TransferMsg, UnbondMsg,
        VoteProposalMsg, WithdrawMsg,
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
            TransactionKind::Transfer(transfer) => {
                let Transfer {
                    sources,
                    targets,
                    // TODO: Implement
                    shielded_section_hash: _,
                } = transfer;

                let mut sources_data: Vec<TransferDataMsg> = vec![];
                let mut targets_data: Vec<TransferDataMsg> = vec![];

                for (source, amount) in sources {
                    let owner = source.owner.to_string();
                    let token = source.token.to_string();
                    let amount = amount.to_string();
                    sources_data.push(TransferDataMsg::new(owner, token, amount))
                }

                for (target, amount) in targets {
                    let owner = target.owner.to_string();
                    let token = target.token.to_string();
                    let amount = amount.to_string();
                    targets_data.push(TransferDataMsg::new(owner, token, amount))
                }

                borsh::to_vec(&TransferMsg::new(sources_data, targets_data, None))?
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

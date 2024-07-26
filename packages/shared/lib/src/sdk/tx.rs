use std::collections::HashMap;
use std::str::FromStr;

use gloo_utils::format::JsValueSerdeExt;
use namada::core::borsh::{self, BorshDeserialize, BorshSerialize};
use namada::sdk::signing::SigningTxData;
use namada::sdk::tx::{
    TX_BOND_WASM, TX_CLAIM_REWARDS_WASM, TX_REDELEGATE_WASM, TX_REVEAL_PK, TX_TRANSFER_WASM,
    TX_UNBOND_WASM, TX_VOTE_PROPOSAL, TX_WITHDRAW_WASM,
};
use namada::sdk::uint::Uint;
use namada::token::Amount;
use namada::tx;
use namada::{address::Address, key::common::PublicKey};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

use super::args::WrapperTxMsg;
use crate::sdk::transaction;
use crate::types::query::WasmHash;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize, Copy, Clone, Debug)]
#[borsh(crate = "namada::core::borsh", use_discriminant = true)]
pub enum TxType {
    Bond = 1,
    Unbond = 2,
    Withdraw = 3,
    Transfer = 4,
    IBCTransfer = 5,
    EthBridgeTransfer = 6,
    RevealPK = 7,
    VoteProposal = 8,
    Redelegate = 9,
    Batch = 10,
    ClaimRewards = 11,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SigningData {
    owner: Option<String>,
    public_keys: Vec<u8>,
    threshold: u8,
    account_public_keys_map: Option<Vec<u8>>,
    fee_payer: String,
}

impl SigningData {
    // Create serializable struct from Namada type
    pub fn from_signing_tx_data(signing_tx_data: SigningTxData) -> Result<SigningData, JsError> {
        let owner: Option<String> = match signing_tx_data.owner {
            Some(addr) => Some(addr.to_string()),
            None => None,
        };
        let public_keys = borsh::to_vec(&signing_tx_data.public_keys)?;
        let fee_payer = signing_tx_data.fee_payer.to_string();
        let account_public_keys_map = match signing_tx_data.account_public_keys_map {
            Some(pk_map) => Some(borsh::to_vec(&pk_map)?),
            None => None,
        };

        Ok(SigningData {
            owner,
            public_keys,
            threshold: signing_tx_data.threshold,
            account_public_keys_map,
            fee_payer,
        })
    }

    // Create Namada type from this struct
    pub fn to_signing_tx_data(&self) -> Result<SigningTxData, JsError> {
        let owner: Option<Address> = match &self.owner {
            Some(addr) => Some(Address::from_str(&addr)?),
            None => None,
        };
        let public_keys = borsh::from_slice(&self.public_keys)?;
        let fee_payer = PublicKey::from_str(&self.fee_payer)?;
        let threshold = self.threshold;
        let account_public_keys_map = match &self.account_public_keys_map {
            Some(pk_map) => Some(borsh::from_slice(&pk_map)?),
            None => None,
        };

        Ok(SigningTxData {
            owner,
            public_keys,
            fee_payer,
            threshold,
            account_public_keys_map,
        })
    }

    pub fn to_bytes(&self) -> Result<Vec<u8>, JsError> {
        Ok(borsh::to_vec(&self)?)
    }
}

pub fn wasm_hash_to_tx_type(wasm_hash: &str, wasm_hashes: &Vec<WasmHash>) -> Option<TxType> {
    let type_map: HashMap<String, TxType> = HashMap::from([
        (TX_TRANSFER_WASM.to_string(), TxType::Transfer),
        (TX_BOND_WASM.to_string(), TxType::Bond),
        (TX_REDELEGATE_WASM.to_string(), TxType::Redelegate),
        (TX_UNBOND_WASM.to_string(), TxType::Unbond),
        (TX_WITHDRAW_WASM.to_string(), TxType::Withdraw),
        (TX_CLAIM_REWARDS_WASM.to_string(), TxType::ClaimRewards),
        (TX_REVEAL_PK.to_string(), TxType::RevealPK),
        (TX_VOTE_PROPOSAL.to_string(), TxType::VoteProposal),
    ]);

    for wh in wasm_hashes {
        if wh.hash() == wasm_hash {
            let tx_type = type_map.get(&wh.path());

            if tx_type.is_some() {
                return Some(*tx_type.unwrap());
            }
        }
    }

    None
}

// Deserialize Tx commitments into Borsh-serialized struct
#[wasm_bindgen]
pub fn deserialize_tx(tx_bytes: Vec<u8>, wasm_hashes: JsValue) -> Result<Vec<u8>, JsError> {
    let tx = TxDetails::from_bytes(tx_bytes, wasm_hashes)?;
    Ok(borsh::to_vec(&tx)?)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct Commitment {
    tx_type: TxType,
    hash: String,
    tx_code_id: String,
    memo: Option<String>,
    data: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct TxDetails {
    wrapper_tx: WrapperTxMsg,
    commitments: Vec<Commitment>,
}

impl TxDetails {
    pub fn from_bytes(tx_bytes: Vec<u8>, wasm_hashes: JsValue) -> Result<TxDetails, JsError> {
        let tx: tx::Tx = borsh::from_slice(&tx_bytes)?;
        let chain_id = tx.header().chain_id.to_string();

        let tx_details = match tx.header().tx_type {
            tx::data::TxType::Wrapper(wrapper) => {
                let fee_amount = wrapper.get_tx_fee()?.to_string();
                let gas_limit = Amount::from_uint(Uint::from(wrapper.gas_limit), 0)?
                    .native_denominated()
                    .to_string();
                let token = wrapper.fee.token.to_string();

                let wrapper_tx =
                    WrapperTxMsg::new(token, fee_amount, gas_limit, chain_id, None, None);
                let mut commitments: Vec<Commitment> = vec![];
                let wasm_hashes: Vec<WasmHash> = wasm_hashes.into_serde().unwrap();

                for cmt in tx.commitments() {
                    let memo = tx
                        .memo(&cmt)
                        .map(|memo_bytes| String::from_utf8_lossy(&memo_bytes).to_string());
                    let hash = cmt.get_hash().to_string();
                    let tx_code_id = tx
                        .get_section(cmt.code_sechash())
                        .and_then(|s| s.code_sec())
                        .map(|s| s.code.hash().0)
                        .map(|bytes| {
                            String::from_utf8(subtle_encoding::hex::encode(bytes)).unwrap()
                        });

                    if tx_code_id.is_some() {
                        let tx_code_id = tx_code_id.unwrap();
                        let tx_type = wasm_hash_to_tx_type(&tx_code_id, &wasm_hashes);

                        if tx_type.is_some() {
                            let tx_type = tx_type.unwrap();
                            let tx_data = tx.data(&cmt).unwrap_or_default();
                            let tx_kind = transaction::TransactionKind::from(tx_type, &tx_data);
                            let data = tx_kind.to_bytes()?;

                            commitments.push(Commitment {
                                tx_type,
                                hash,
                                tx_code_id,
                                memo,
                                data,
                            });
                        }
                    }
                }

                Ok(TxDetails {
                    wrapper_tx,
                    commitments,
                })
            }
            _ => Err(JsError::new("Invalid transaction type!")),
        };

        Ok(tx_details?)
    }
}

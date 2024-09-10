use std::collections::HashMap;
use std::str::FromStr;

use gloo_utils::format::JsValueSerdeExt;
use namada_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use namada_sdk::signing::SigningTxData;
use namada_sdk::tx::data::compute_inner_tx_hash;
use namada_sdk::tx::either::Either;
use namada_sdk::tx::{
    self, TX_BOND_WASM, TX_CLAIM_REWARDS_WASM, TX_REDELEGATE_WASM, TX_REVEAL_PK, TX_TRANSFER_WASM,
    TX_UNBOND_WASM, TX_VOTE_PROPOSAL, TX_WITHDRAW_WASM,
};
use namada_sdk::uint::Uint;
use namada_sdk::{address::Address, key::common::PublicKey};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

use super::args::WrapperTxMsg;
use crate::sdk::transaction;
use crate::types::query::WasmHash;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize, Copy, Clone, Debug)]
#[borsh(crate = "namada_sdk::borsh", use_discriminant = true)]
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

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct SigningData {
    owner: Option<String>,
    public_keys: Vec<String>,
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
        let public_keys = signing_tx_data
            .public_keys
            .into_iter()
            .map(|pk| pk.to_string())
            .collect();

        let account_public_keys_map = match signing_tx_data.account_public_keys_map {
            Some(pk_map) => Some(borsh::to_vec(&pk_map)?),
            None => None,
        };

        let fee_payer = signing_tx_data.fee_payer.to_string();
        let threshold = signing_tx_data.threshold;

        Ok(SigningData {
            owner,
            public_keys,
            threshold,
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

        let mut public_keys: Vec<PublicKey> = vec![];
        for pk in self.public_keys.clone() {
            let pk = PublicKey::from_str(&pk)?;
            public_keys.push(pk);
        }

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
}

/// Serializable Tx for exported build functions
#[derive(BorshSerialize, BorshDeserialize, Clone, Debug)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct Tx {
    args: WrapperTxMsg,
    hash: String,
    bytes: Vec<u8>,
    signing_data: Vec<SigningData>,
}

impl Tx {
    pub fn new(
        tx: tx::Tx,
        args: &[u8],
        signing_tx_data: Vec<SigningTxData>,
    ) -> Result<Tx, JsError> {
        let args: WrapperTxMsg = borsh::from_slice(&args)?;
        let mut signing_data: Vec<SigningData> = vec![];
        for sd in signing_tx_data.into_iter() {
            let sd = SigningData::from_signing_tx_data(sd)?;
            signing_data.push(sd);
        }
        let hash = tx.wrapper_hash();
        let bytes: Vec<u8> = borsh::to_vec(&tx)?;

        Ok(Tx {
            args,
            hash: hash.unwrap().to_string(),
            bytes,
            signing_data,
        })
    }

    pub fn tx_bytes(&self) -> Vec<u8> {
        self.bytes.clone()
    }

    pub fn signing_tx_data(&self) -> Result<Vec<SigningTxData>, JsError> {
        let mut signing_tx_data: Vec<SigningTxData> = vec![];
        for sd in self.signing_data.clone().iter() {
            signing_tx_data.push(sd.to_signing_tx_data()?);
        }

        Ok(signing_tx_data)
    }

    pub fn args(&self) -> WrapperTxMsg {
        self.args.clone()
    }
}

// Given the bytes of a Namada Tx, return all inner Tx hashes
#[wasm_bindgen]
pub fn get_inner_tx_hashes(tx_bytes: &[u8]) -> Result<Vec<String>, JsError> {
    let nam_tx: tx::Tx = borsh::from_slice(tx_bytes)?;
    let hash = nam_tx.wrapper_hash();
    let cmts = nam_tx.commitments();
    let mut inner_tx_hashes: Vec<String> = vec![];

    for cmt in cmts {
        let inner_tx_hash = compute_inner_tx_hash(hash.as_ref(), Either::Right(&cmt));
        inner_tx_hashes.push(inner_tx_hash.to_string());
    }

    Ok(inner_tx_hashes)
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
#[borsh(crate = "namada_sdk::borsh")]
pub struct Commitment {
    tx_type: TxType,
    hash: String,
    tx_code_id: String,
    memo: Option<String>,
    data: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada_sdk::borsh")]
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
                let fee_amount = wrapper.fee.amount_per_gas_unit.to_string();
                let gas_limit = Uint::from(wrapper.gas_limit).to_string();
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

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct BatchTxResult {
    hash: String,
    is_applied: bool,
}

impl BatchTxResult {
    pub fn new(hash: String, is_applied: bool) -> BatchTxResult {
        BatchTxResult { hash, is_applied }
    }
}

/// Serializable response for process_tx calls
#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct TxResponse {
    code: String,
    commitments: Vec<BatchTxResult>,
    gas_used: String,
    hash: String,
    height: String,
    info: String,
    log: String,
}

impl TxResponse {
    pub fn new(
        code: String,
        commitments: Vec<BatchTxResult>,
        gas_used: String,
        hash: String,
        height: String,
        info: String,
        log: String,
    ) -> TxResponse {
        TxResponse {
            code,
            commitments,
            gas_used,
            hash,
            height,
            info,
            log,
        }
    }
}

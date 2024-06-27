use std::str::FromStr;

use namada::core::borsh::{self, BorshDeserialize, BorshSerialize};
use namada::sdk::signing::SigningTxData;
use namada::tx;
use namada::{address::Address, key::common::PublicKey};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

use crate::sdk::transaction;

#[wasm_bindgen]
#[derive(BorshSerialize, BorshDeserialize, Copy, Clone, Debug)]
#[borsh(crate = "namada::core::borsh", use_discriminant = true)]
pub enum TxType {
    Bond = 1,
    Unbond = 2,
    Withdraw = 3,
    TransparentTransfer = 4,
    IBCTransfer = 5,
    EthBridgeTransfer = 6,
    RevealPK = 7,
    VoteProposal = 8,
    Redelegate = 9,
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

// Deserialize Tx commitments into Borsh-serialized struct
#[wasm_bindgen]
pub fn deserialize_tx(tx_type: TxType, tx_bytes: Vec<u8>) -> Result<Vec<u8>, JsError> {
    let tx = Tx::from_bytes(tx_type, tx_bytes)?;
    Ok(borsh::to_vec(&tx)?)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct Commitment {
    tx_type: TxType,
    data: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct Tx {
    wrapper_tx: Vec<u8>,
    commitments: Vec<Commitment>,
}

impl Tx {
    pub fn from_bytes(tx_type: TxType, tx_bytes: Vec<u8>) -> Result<Tx, JsError> {
        let tx: tx::Tx = borsh::from_slice(&tx_bytes)?;

        let mut commitments: Vec<Commitment> = vec![];

        for cmt in tx.commitments() {
            let tx_data = tx.data(&cmt).unwrap_or_default();
            let tx_kind = transaction::TransactionKind::from(tx_type, &tx_data);
            let cmt_bytes = tx_kind.to_bytes()?;

            commitments.push(Commitment {
                tx_type,
                data: cmt_bytes,
            });
        }

        Ok(Tx {
            wrapper_tx: vec![0, 1, 2, 3, 4], // TODO
            commitments,
        })
    }
}

use crate::types::tx::Tx;
use borsh::BorshSerialize;
use namada::{proto, types::{key, transaction, token, storage, address}};
use namada::types::key::common::SecretKey;
use std::str::FromStr;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WrapperTx(pub(crate) transaction::WrapperTx);

impl WrapperTx {
    pub fn new(wrapper_tx: transaction::WrapperTx) -> Self {
        Self(wrapper_tx)
    }

    pub fn wrap(
        token: address::Address,
        fee_amount: u32,
        secret: String,
        epoch: u32,
        gas_limit: u32,
        tx: proto::Tx,
    ) -> transaction::WrapperTx {
        let gas_limit = transaction::GasLimit::from(u64::from(gas_limit));
        let amount = token::Amount::from(u64::from(fee_amount));
        let signing_key = SecretKey::Ed25519(key::ed25519::SecretKey::from_str(&secret).unwrap());
        let encryption_key = transaction::EncryptionKey::default();

        transaction::WrapperTx::new(
            transaction::Fee {
                amount,
                token,
            },
            &signing_key,
            storage::Epoch(u64::from(epoch)),
            gas_limit,
            tx,
            encryption_key,
        )
    }

    pub fn sign(wrapper_tx: transaction::WrapperTx, secret: String ) -> proto::Tx {
        let keypair = SecretKey::Ed25519(key::ed25519::SecretKey::from_str(&secret).unwrap());
        (Tx::to_proto(
            vec![],
            transaction::TxType::Wrapper(wrapper_tx)
                .try_to_vec().expect("Could not serialize WrapperTx")
        )).sign(&keypair)
    }
}

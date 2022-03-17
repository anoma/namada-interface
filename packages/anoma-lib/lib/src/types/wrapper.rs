use crate::types::{address::Address, tx::Tx};
use anoma::{proto, types::{transaction, token, storage, key}};
use borsh::{BorshSerialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WrapperTx(pub(crate) transaction::WrapperTx);

impl WrapperTx {
    pub fn new(
        token: Address,
        fee_amount: u32,
        keypair: &key::ed25519::Keypair,
        epoch: u32,
        gas_limit: u32,
        tx: proto::Tx,
    ) -> transaction::WrapperTx {
        let gas_limit = transaction::GasLimit::from(u64::from(gas_limit));
        let amount = token::Amount::from(u64::from(fee_amount));

        transaction::WrapperTx::new(
            transaction::Fee {
                amount,
                token: token.0,
            },
            &keypair,
            storage::Epoch(u64::from(epoch)),
            transaction::GasLimit::from(gas_limit),
            tx,
        )
    }

    pub fn sign(wrapper_tx: transaction::WrapperTx, keypair: &key::ed25519::Keypair ) -> proto::Tx {
        (Tx::new(
            vec![],
            transaction::TxType::Wrapper(wrapper_tx)
                .clone()
                .try_to_vec().expect("Could not serialize WrapperTx")
        )).sign(&keypair)
    }
}

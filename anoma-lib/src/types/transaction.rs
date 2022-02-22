use crate::types::{
    address::Address,
    keypair::Keypair,
    tx::Tx,
    wrapper::WrapperTx,
};
use anoma::types::{key};
use serde::{Serialize,Deserialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct Transaction {
    pub hash: String,
    pub bytes: Vec<u8>,
}

impl Transaction {
    pub fn new(
        serialized_keypair: JsValue,
        token: Address,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: Vec<u8>,
        data: Vec<u8>,
    ) -> Result<Transaction, JsValue> {
        let source_keypair = Keypair::deserialize(serialized_keypair)?;
        let keypair = key::ed25519::Keypair::from_bytes(&source_keypair.to_bytes())
            .expect("Could not create keypair from bytes");

        let tx = Tx::new(
            tx_code,
            data,
        ).sign(&keypair);

        let wrapper_tx = WrapperTx::new(
            token,
            fee_amount,
            &keypair,
            epoch,
            gas_limit,
            tx,
        );

        let hash = wrapper_tx.tx_hash.to_string();
        let wrapper_tx = WrapperTx::sign(wrapper_tx, &keypair);
        let bytes = wrapper_tx.to_bytes();

        // Return serialized wrapped & signed transaction as bytes with hash
        // in a tuple:
        Ok(Transaction {
            hash,
            bytes,
        })
    }
}

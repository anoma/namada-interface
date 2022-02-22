use crate::types::{
    address::Address,
    keypair::Keypair,
    tx::Tx,
    wrapper::WrapperTx,
};
use anoma::types::{key,token};
use borsh::BorshSerialize;
use wasm_bindgen::prelude::*;
use serde::{Serialize,Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Transfer {
    pub hash: String,
    pub bytes: Vec<u8>,
}

#[wasm_bindgen]
impl Transfer {
    pub fn new(
        serialized_keypair: JsValue,
        encoded_source: String,
        encoded_target: String,
        token: String,
        amount: u32,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let source_keypair = Keypair::deserialize(serialized_keypair)?;
        let source = Address::decode(encoded_source)?;
        let target = Address::decode(encoded_target)?;
        let token = Address::decode(token)?;
        let amount = token::Amount::from(u64::from(amount));
        let tx_code: Vec<u8> = tx_code.to_vec();
        let keypair = key::ed25519::Keypair::from_bytes(&source_keypair.to_bytes())
            .expect("Could not create keypair from bytes");

        let transfer = token::Transfer {
            source: source.0,
            target: target.0,
            token: token.0.clone(),
            amount,
        };

        let data = transfer
            .try_to_vec()
            .expect("Encoding unsigned transfer shouldn't fail");

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
        Ok(JsValue::from_serde(&Transfer {
            hash,
            bytes,
        }).unwrap())
    }
}

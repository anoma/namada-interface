use crate::types::{
    address::Address,
    transaction::Transaction,
    keypair::Keypair,
};
use anoma::types::{
    transaction::InitAccount,
    key::ed25519::PublicKey,
};
use borsh::BorshSerialize;
use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize,Deserialize)]
pub struct Account(pub Transaction);

#[wasm_bindgen]
impl Account {
    /// Initialize an account on the Ledger
    pub fn init(
        serialized_keypair: JsValue,
        token: String,
        epoch: u32,
        fee_amount: u32,
        gas_limit: u32,
        tx_code: &[u8],
        vp_code: &[u8],
    ) -> Result<JsValue, JsValue> {
        let token = Address::decode(token)?;
        let tx_code: Vec<u8> = tx_code.to_vec();
        let vp_code: Vec<u8> = vp_code.to_vec();
        let keypair = &Keypair::from_js_value_to_pointer(serialized_keypair.clone())
            .expect("Keypair could not be deserialized");
        let public_key = PublicKey::from(keypair.0.public.clone());

        let data = InitAccount {
            public_key,
            vp_code: vp_code.clone(),
        };
        let data = data.try_to_vec().expect("Encoding tx data shouldn't fail");

        let transaction = match Transaction::new(
            serialized_keypair,
            token,
            epoch,
            fee_amount,
            gas_limit,
            tx_code,
            data
        ) {
            Ok(transaction) => transaction,
            Err(error) => return Err(error)
        };
    
        // Return serialized Transaction
        Ok(JsValue::from_serde(&Account(transaction)).unwrap())
    }
}

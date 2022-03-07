use crate::address::Address;
use crate::keypair::Keypair;
use anoma::proto;
use anoma::types::token;
use borsh::BorshSerialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Tx(pub(crate) proto::Tx);

#[wasm_bindgen]
pub fn make_transfer(
    serialized_keypair: JsValue,
    encoded_target: String,
    token: String,
    amount: u64,
    tx_code: &[u8],
) -> Result<Tx, JsValue> {
    let source_keypair = Keypair::deserialize(serialized_keypair)?;
    let source = Address::from_keypair(&source_keypair);
    let target = Address::decode(encoded_target)?;
    let token = Address::decode(token)?;
    let amount = token::Amount::from(amount);
    let tx_code: Vec<u8> = tx_code.to_vec();

    let transfer = token::Transfer {
        source: source.0,
        target: target.0,
        token: token.0,
        amount,
    };

    let data = transfer
        .try_to_vec()
        .expect("Encoding unsigned transfer shouldn't fail");

    Ok(Tx(proto::Tx::new(tx_code, Some(data)).sign(&source_keypair.0)))
}

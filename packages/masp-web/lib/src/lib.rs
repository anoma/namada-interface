mod shielded_account;
mod shielded_transaction;

use shielded_account::ShieldedAccount;
use shielded_transaction::create_shielded_transfer as create_shielded_transfer_implementation;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn create_shielded_transfer(
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    payment_address_as_string: String,
    token_address: String,
    amount: u64,
    spend_param_bytes: &[u8],
    output_param_bytes: &[u8],
) -> Option<Vec<u8>> {
    create_shielded_transfer_implementation(
        shielded_transactions,
        spending_key_as_string,
        payment_address_as_string,
        token_address,
        amount,
        spend_param_bytes,
        output_param_bytes,
    )
}

#[wasm_bindgen]
pub fn create_shielded_account(alias: String, password: Option<String>) -> JsValue {
    ShieldedAccount::new(alias, password)
}

mod shielded_account;
mod shielded_transaction;

use shielded_account::ShieldedAccount;
use shielded_transaction::{
    create_shielded_transfer as create_shielded_transfer_implementation,
    get_shielded_balance as get_shielded_balance_implementation,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn create_shielded_transfer(
    shielded_transactions: JsValue,
    spending_key_as_string: Option<String>,
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
pub fn get_shielded_balance(
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    token_address: String,
) -> Option<u64> {
    get_shielded_balance_implementation(
        shielded_transactions,
        spending_key_as_string,
        token_address,
    )
}

#[wasm_bindgen]
pub fn create_master_shielded_account(
    alias: String,
    seed_phrase: String,
    password: Option<String>,
) -> JsValue {
    ShieldedAccount::new_master_account(alias, seed_phrase, password)
}

#[wasm_bindgen]
pub fn create_derived_shielded_account(
    alias: String,
    path: String,
    password: Option<String>,
) -> JsValue {
    ShieldedAccount::new_derived_account(alias, path, password)
}

pub mod account;
pub mod ibc_transfer;
pub mod transfer;
pub mod types;
mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}

use wasm_bindgen::prelude::*;

pub mod transfer;
pub mod account;
mod utils;
mod types;

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}

pub mod shared;
mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn run() {
    utils::set_panic_hook();
}

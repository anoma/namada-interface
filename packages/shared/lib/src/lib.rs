//! # shared
//!
//! A library of functions to integrate shared functionality from the Namada ecosystem

pub mod query;
pub mod rpc_client;
pub mod sdk;
pub mod types;
mod utils;

#[cfg(feature = "multicore")]
pub use wasm_bindgen_rayon::init_thread_pool;

// Empty function for non-multicore builds
// Simplifies imports in js code
#[cfg(not(feature = "multicore"))]
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(not(feature = "multicore"))]
#[allow(non_snake_case)]
#[wasm_bindgen]
pub async fn initThreadPool(_threads: u8) {}

// use aes::Aes256;
use aes::cipher::{
    // BlockCipher, BlockEncrypt, BlockDecrypt, KeyInit,
    generic_array::GenericArray,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct AES {
    key: Vec<u8>,
}

#[wasm_bindgen]
impl AES {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let key: &[u8]  = &GenericArray::from([0u8; 16]);

        Self {
            key: Vec::from(key),
        }
    }

    pub fn key(&self) -> Vec<u8> {
        self.key.clone()
    }
}

impl Default for AES {
    fn default() -> Self { 
        Self::new()
    }
}

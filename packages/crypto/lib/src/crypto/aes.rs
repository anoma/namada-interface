use aes_gcm::{
    aead::{Aead, KeyInit, generic_array::GenericArray},
    Aes256Gcm, Nonce,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Error)]
pub enum AESError {
    #[error("Invalid key size! Minimum key size is 32.")]
    KeyLengthError,
    #[error("Invalid IV! Expected 96 bits (12 bytes)")]
    IVSizeError,
}

#[wasm_bindgen]
pub struct AES {
    cipher: Aes256Gcm,
    iv: [u8; 12],
}

#[wasm_bindgen]
impl AES {
    #[wasm_bindgen(constructor)]
    pub fn new(key: Vec<u8>, iv: Vec<u8>) -> Result<AES, String> {
        if key.len() < 32 {
            return Err(format!("{} Received {}", AESError::KeyLengthError, key.len()));
        }
        let key = GenericArray::from_iter(key.into_iter());
        let iv: [u8; 12] = match iv.try_into() {
            Ok(iv) => iv,
            Err(_) => return Err(AESError::IVSizeError.to_string()),
        };

        Ok(AES {
            cipher: Aes256Gcm::new(&key),
            iv,
        })
    }

    pub fn encrypt(&self, text: &str) -> Result<Vec<u8>, String> {
        let nonce = Nonce::from_slice(&self.iv);
        let ciphertext = self.cipher.encrypt(nonce, text.as_ref())
            .map_err(|err| err.to_string())?;

        Ok(ciphertext)
    }

    pub fn decrypt(&self, ciphertext: Vec<u8>) -> Result<Vec<u8>, String> {
        let nonce = Nonce::from_slice(&self.iv);
        let plaintext = self.cipher.decrypt(nonce, ciphertext.as_ref())
            .map_err(|err| err.to_string())?;
        Ok(plaintext)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::rng::{Rng, ByteSize};

    #[test]
    fn can_encrypt_and_decrypt() {
        let key = Rng::generate_bytes(Some(ByteSize::N32))
            .expect("Generating random bytes should not fail");
        let iv = Rng::generate_bytes(Some(ByteSize::N12))
            .expect("Generating random bytes should not fail");
        let aes = AES::new(key, iv).unwrap();
        let plaintext = "my secret message";
        let encrypted = aes.encrypt(plaintext)
            .expect("AES should not fail encrypting plaintext");

        let decrypted: &[u8] = &aes.decrypt(encrypted)
            .expect("AES should not fail decrypting ciphertext");
        let decrypted = std::str::from_utf8(decrypted)
            .expect("Should parse as string");

        assert_eq!(decrypted, plaintext);
    }
}

use aes_gcm::{
    aead::{ Aead, KeyInit, generic_array::GenericArray},
    Aes256Gcm, Nonce,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;

#[derive(Debug, Error)]
pub enum AESError {
    #[error("Invalid key size! Minimum key size is 32.")]
    KeyLengthError,
    #[error("Invalid IV! Expected 12 bytes")]
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

    #[test]
    fn can_encrypt_and_decrypt() {
        let key = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                       17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
                       31, 32];

        let iv = Vec::from("123456789123".as_bytes());
        let aes = AES::new(key, iv).unwrap();
        let plaintext = "my secret message";
        let encrypted = aes.encrypt(plaintext)
            .expect("AES should not fail encrypting plaintext");

        let expected = vec![167, 153, 113, 97, 196, 71, 31, 31, 86, 208, 157, 103, 7,
                            76, 51, 137, 154, 156, 83, 43, 154, 92, 9, 209, 114, 82,
                            33, 40, 255, 125, 31, 97, 188];

        assert_eq!(encrypted, expected);

        let decrypted: &[u8] = &aes.decrypt(encrypted)
            .expect("AES should not fail decrypting ciphertext");
        let decrypted = std::str::from_utf8(decrypted)
            .expect("Should parse as string");

        assert_eq!(decrypted, plaintext);
    }
}

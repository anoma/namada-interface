use crate::crypto::pointer_types::VecU8Pointer;
use aes_gcm::{
    aead::{generic_array::GenericArray, Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use thiserror::Error;
use wasm_bindgen::prelude::*;
use zeroize::Zeroize;

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
    pub fn new(key: VecU8Pointer, iv: Vec<u8>) -> Result<AES, String> {
        if key.length < 32 {
            return Err(format!(
                "{} Received {}",
                AESError::KeyLengthError,
                key.length
            ));
        }
        let mut key = GenericArray::from_iter(key.vec.clone());
        let iv: [u8; 12] = match iv.try_into() {
            Ok(iv) => iv,
            Err(_) => {
                key.zeroize();
                return Err(AESError::IVSizeError.to_string());
            }
        };

        let aes = AES {
            cipher: Aes256Gcm::new(&key),
            iv,
        };
        key.zeroize();
        Ok(aes)
    }

    pub fn encrypt(&self, mut text: String) -> Result<Vec<u8>, String> {
        let nonce = Nonce::from_slice(&self.iv);
        let result = self
            .cipher
            .encrypt(nonce, text.as_ref())
            .map_err(|err| err.to_string());
        text.zeroize();
        result
    }

    pub fn decrypt(&self, ciphertext: Vec<u8>) -> Result<VecU8Pointer, String> {
        let nonce = Nonce::from_slice(&self.iv);
        let plaintext = self
            .cipher
            .decrypt(nonce, ciphertext.as_ref())
            .map_err(|err| err.to_string())?;

        Ok(VecU8Pointer::new(plaintext))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::rng::{ByteSize, Rng};
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_encrypt_and_decrypt() {
        let key = Rng::generate_bytes(Some(ByteSize::N32))
            .expect("Generating random bytes should not fail");
        let iv = Rng::generate_bytes(Some(ByteSize::N12))
            .expect("Generating random bytes should not fail");
        let aes = AES::new(VecU8Pointer::new(key), iv).unwrap();
        let plaintext = "my secret message";
        let encrypted = aes
            .encrypt(String::from(plaintext))
            .expect("AES should not fail encrypting plaintext");

        let decrypted: &[u8] = &aes
            .decrypt(encrypted)
            .expect("AES should not fail decrypting ciphertext")
            .vec;
        let decrypted = std::str::from_utf8(decrypted).expect("Should parse as string");

        assert_eq!(decrypted, plaintext);
    }
}

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use gloo_utils::format::JsValueSerdeExt;
use hkdf::Hkdf;
use js_sys::JsString;
use password_hash::rand_core::RngCore;
use serde::Serialize;
use sha2::Sha256;
use wasm_bindgen::prelude::*;
use x25519_dalek::{EphemeralSecret, PublicKey};
use zeroize::Zeroize;
use zeroize::ZeroizeOnDrop;

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
struct SecureMessage {
    secret: Option<EphemeralSecret>, // Wrap in Option
}

#[wasm_bindgen]
impl SecureMessage {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console_error_panic_hook::set_once();
        let secret = EphemeralSecret::random();

        Self {
            secret: Some(secret), // Store it in an Option
        }
    }

    pub fn get_public_key(&self) -> Result<JsValue, JsError> {
        let public_key = PublicKey::from(self.secret.as_ref().expect("Secret is missing"));

        to_js_result(public_key)
    }

    // Encrypt a message with AES-GCM
    pub fn encrypt_message(
        &mut self,
        other_pk: JsValue,
        plaintext: &[u8],
    ) -> Result<JsValue, JsError> {
        let public_key = PublicKey::from(self.secret.as_ref().expect("Secret is missing"));
        let other_public: PublicKey = other_pk
            .into_serde()
            .expect("Failed to deserialize public key");
        let mut salt = [0u8; 16]; // 128-bit salt
        OsRng.fill_bytes(&mut salt);

        let aes_key = self.get_aes_key(other_public, &salt);

        let cipher = Aes256Gcm::new(&aes_key);

        // Generate a random IV (Nonce) for AES-GCM
        let mut iv = [0u8; 12];
        OsRng
            .try_fill_bytes(&mut iv)
            .expect("Failed to generate IV");
        let nonce = Nonce::from_slice(&iv);

        // Encrypt the message
        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .expect("encryption failure!");

        to_js_result((ciphertext, iv.to_vec(), public_key, salt)) // Return ciphertext and IV
    }

    // Decrypt the message
    pub fn decrypt_message(
        &mut self,
        ciphertext: &[u8],
        iv: &[u8],
        other_pk: JsValue,
        salt: &[u8],
    ) -> Result<JsValue, JsError> {
        let other_public: PublicKey = other_pk
            .into_serde()
            .expect("Failed to deserialize public key");
        let aes_key = self.get_aes_key(other_public, salt);
        let cipher = Aes256Gcm::new(&aes_key);
        let nonce = Nonce::from_slice(iv);

        // Decrypt the message
        let decrypted = cipher
            .decrypt(nonce, ciphertext)
            .expect("decryption failure!");

        to_js_result(decrypted) // Return the decrypted message
    }
}

impl SecureMessage {
    fn get_aes_key(&mut self, other_public: PublicKey, salt: &[u8]) -> Key<Aes256Gcm> {
        // Use `take()` to move out the secret and leave None in its place
        let secret = self.secret.take().expect("Secret already used");
        let shared_secret = secret.diffie_hellman(&other_public);

        let hkdf = Hkdf::<Sha256>::new(Some(salt), &shared_secret.to_bytes());
        let mut okm = [0u8; 32]; // Output key material (AES-256 = 32 bytes)
        hkdf.expand(b"", &mut okm).expect("Failed to derive key");

        let key = *Key::<Aes256Gcm>::from_slice(&okm);

        // Zeroize the output key material after creating the key
        okm.zeroize();

        key
    }
}

/// Maps a result to a JsValue using Serde and Error into a JsError
///
/// # Arguments
///
/// * `result` - The result to map
pub fn to_js_result<T>(result: T) -> Result<JsValue, JsError>
where
    T: Serialize,
{
    match JsValue::from_serde(&result) {
        Ok(v) => Ok(v),
        Err(e) => Err(JsError::new(&e.to_string())),
    }
}

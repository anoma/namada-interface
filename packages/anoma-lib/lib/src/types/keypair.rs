use anoma::types::key::ed25519::{Keypair as NativeKeypair, PublicKey as NativePublicKey};

use super::encrypted_keypair::EncryptedKeypair;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub enum PhraseSize {
    N12 = 12,
    N24 = 24,
}

#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub struct PublicKey(pub(crate) NativePublicKey);

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct Keypair(pub(crate) NativeKeypair);

#[wasm_bindgen]
#[allow(dead_code)]
pub fn generate_mnemonic(size: PhraseSize) -> String {
    use bip39::{Language, Mnemonic};
    use rand_bip::prelude::ThreadRng;
    use rand_bip::thread_rng;

    let mut rng: ThreadRng = thread_rng();
    Mnemonic::generate_in_with(&mut rng, Language::English, size as usize)
        .unwrap()
        .to_string()
}

impl From<NativeKeypair> for Keypair {
    fn from(native_keypair: NativeKeypair) -> Self {
        Keypair(native_keypair)
    }
}

#[wasm_bindgen]
impl Keypair {
    #[wasm_bindgen]
    pub fn from_mnemonic(mnemonic: &str, iterations: usize) -> Keypair {
        use rand_chacha::ChaCha20Rng;
        use rand_seeder::Seeder;
        let mut rng: ChaCha20Rng = Seeder::from(mnemonic).make_rng();
        for _ in 0..iterations {
            let _: Keypair = NativeKeypair::generate(&mut rng).into();
        }

        NativeKeypair::generate(&mut rng).into()
    }

    #[wasm_bindgen]
    pub fn from_pointer_to_js_value(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self).unwrap()
    }

    #[wasm_bindgen]
    pub fn from_js_value_to_pointer(js_data: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(js_data).map_err(|err| JsValue::from_str(&err.to_string()))
    }

    #[wasm_bindgen]
    pub fn encrypt_with_password(&self, password: String) -> Result<Vec<u8>, JsValue> {
        let Keypair(native_key_pair) = self.to_owned();
        let encrypted_key_pair = EncryptedKeypair::encrypt(native_key_pair, password);
        let EncryptedKeypair(encrypted_key_pair_data) = encrypted_key_pair;
        Ok(encrypted_key_pair_data)
    }

    #[wasm_bindgen]
    pub fn decrypt_with_password(
        encrypted_key_pair_data: Vec<u8>,
        password: String,
    ) -> Option<Keypair> {
        let encrypted_key_pair = EncryptedKeypair(encrypted_key_pair_data);
        let decrypted_key_pair = encrypted_key_pair.decrypt(password);
        match decrypted_key_pair {
            Ok(key_pair) => Some(Keypair(key_pair)),
            Err(_decryption_error) => None,
        }
    }

    #[wasm_bindgen]
    pub fn to_bytes(self) -> Box<[u8]> {
        Box::new(self.0.to_bytes())
    }
}

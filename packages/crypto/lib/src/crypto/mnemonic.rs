use thiserror::Error;
use wasm_bindgen::prelude::*;

#[allow(missing_docs)]
#[derive(Debug, Error)]
pub enum DecryptionError {
    #[error("Unexpected encryption salt")]
    BadSalt,
    #[error("Unable to decrypt the mnemonic. Is the password correct?")]
    DecryptionError,
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum PhraseSize {
    N12 = 12,
    N24 = 24,
}

#[wasm_bindgen]
pub struct Mnemonic {
    phrase: String,
}

#[wasm_bindgen]
impl Mnemonic {
    pub fn new(size: PhraseSize) -> Mnemonic {
        use rand_bip::prelude::ThreadRng;
        use rand_bip::thread_rng;
        let mut rng: ThreadRng = thread_rng();

        Mnemonic {
            phrase: bip39::Mnemonic::generate_in_with(&mut rng, bip39::Language::English, size as usize)
                .unwrap()
                .to_string(),
        }
    }

    pub fn phrase(&self) -> String {
        String::from(&self.phrase)
    }

    pub fn from_phrase(phrase: String) -> Mnemonic {
        Mnemonic {
            phrase
        }
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let bytes = self.phrase.as_bytes();
        Vec::from(bytes)
    }
}


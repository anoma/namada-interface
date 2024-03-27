use crate::crypto::pointer_types::{
    new_vec_string_pointer, StringPointer, VecStringPointer, VecU8Pointer,
};
use bip39::{Language, Mnemonic as M, MnemonicType, Seed};
use thiserror::Error;
use wasm_bindgen::prelude::*;
use zeroize::Zeroize;

#[derive(Debug, Error)]
pub enum Bip39Error {
    #[error("Invalid phrase")]
    InvalidPhrase,
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum PhraseSize {
    N12 = 12,
    N24 = 24,
}

#[wasm_bindgen]
pub struct Mnemonic {
    mnemonic: M,
}

#[wasm_bindgen]
impl Mnemonic {
    #[wasm_bindgen(constructor)]
    pub fn new(size: PhraseSize) -> Mnemonic {
        let mnemonic_type = match size {
            PhraseSize::N12 => MnemonicType::Words12,
            PhraseSize::N24 => MnemonicType::Words24,
        };

        let mnemonic = M::new(mnemonic_type, Language::English);

        Mnemonic { mnemonic }
    }

    pub fn validate(phrase: &str) -> bool {
        M::validate(phrase, Language::English).is_ok()
    }

    pub fn from_phrase(mut phrase: String) -> Result<Mnemonic, String> {
        let mnemonic = M::from_phrase(&phrase, Language::English)
            .map_err(|e| format!("{}: {:?}", Bip39Error::InvalidPhrase, e))?;

        phrase.zeroize();

        Ok(Mnemonic { mnemonic })
    }

    pub fn to_seed(&self, passphrase: Option<StringPointer>) -> Result<VecU8Pointer, String> {
        let mut passphrase = match passphrase {
            Some(passphrase) => passphrase.string.clone(),
            None => "".into(),
        };

        let seed = Seed::new(&self.mnemonic, &passphrase);
        passphrase.zeroize();

        Ok(VecU8Pointer::new(Vec::from(seed.as_bytes())))
    }

    pub fn to_words(&self) -> Result<VecStringPointer, String> {
        let words: Vec<String> = self
            .mnemonic
            .phrase()
            .clone()
            .split(' ')
            .map(|word| String::from(word))
            .collect();
        Ok(new_vec_string_pointer(words))
    }

    pub fn phrase(&self) -> String {
        String::from(self.mnemonic.phrase())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_mnemonic_from_size() {
        let mnemonic = Mnemonic::new(PhraseSize::N12);
        let phrase = mnemonic.phrase();
        let words: Vec<&str> = phrase.split(' ').collect();

        assert_eq!(words.iter().len(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::N24);
        let phrase = mnemonic.phrase();
        let words: Vec<&str> = phrase.split(' ').collect();

        assert_eq!(words.iter().len(), 24);
    }

    #[wasm_bindgen_test]
    fn can_generate_seed_from_phrase() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic = Mnemonic::from_phrase(phrase.into()).unwrap();
        let seed = mnemonic
            .to_seed(None)
            .expect("Should return seed from mnemonic phrase");

        assert_eq!(seed.vec.len(), 64);
    }

    #[wasm_bindgen_test]
    fn invalid_phrase_should_panic() {
        let bad_phrase = "caught pig embody hip goose like become";
        let res = Mnemonic::from_phrase(bad_phrase.into());

        assert!(res.is_err());
    }

    #[wasm_bindgen_test]
    fn can_generate_word_list_from_mnemonic() {
        let mnemonic = Mnemonic::new(PhraseSize::N12);
        let words = mnemonic
            .to_words()
            .expect("Should return a VecStringPointer containing the words");

        assert_eq!(words.strings.len(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::N24);
        let words = mnemonic
            .to_words()
            .expect("Should return a VecStringPointer containing the words");

        assert_eq!(words.strings.len(), 24);
    }
}

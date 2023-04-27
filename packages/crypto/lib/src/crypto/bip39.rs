use wasm_bindgen::prelude::*;
use bip0039::Count;
use zeroize::{Zeroize, ZeroizeOnDrop};
use crate::crypto::pointer_types::{
    StringPointer,
    VecU8Pointer,
    VecStringPointer,
    new_vec_string_pointer
};

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum PhraseSize {
    N12 = 12,
    N24 = 24,
}

#[derive(Zeroize, ZeroizeOnDrop)]
#[wasm_bindgen]
pub struct Mnemonic {
    phrase: String,
}

#[wasm_bindgen]
impl Mnemonic {
    #[wasm_bindgen(constructor)]
    pub fn new(size: PhraseSize) -> Result<Mnemonic, String> {
        let count: Count = match size {
            PhraseSize::N12 => Count::Words12,
            PhraseSize::N24 => Count::Words24,
        };
        let mnemonic = bip0039::Mnemonic::generate(count);

        Ok(Mnemonic { phrase: mnemonic.to_string() })
    }

    fn validate(phrase: &str) -> Result<(), String> {
        let split = &phrase.split(' ');
        let words: Vec<&str> = split.clone().collect();

        if words.len() != PhraseSize::N12 as usize
            && words.len() != PhraseSize::N24 as usize {
            return Err("Invalid mnemonic phrase!".into());
        }

        Ok(())
    }

    pub fn from_phrase(mut phrase: String) -> Result<Mnemonic, String> {
        if let Err(e) = Mnemonic::validate(&phrase) {
            phrase.zeroize();
            return Err(e)
        }

        Ok(Mnemonic { phrase })
    }

    pub fn to_seed(&self, passphrase: Option<StringPointer>) -> Result<VecU8Pointer, String> {
        let mut passphrase = match passphrase {
            Some(passphrase) => passphrase.string.clone(),
            None => "".into(),
        };
        let mnemonic = match bip0039::Mnemonic::from_phrase(self.phrase.clone()) {
            Ok(mnemonic) => mnemonic,
            Err(_) => return Err(String::from("Unable to parse mnemonic!")),
        };
        let seed: &[u8] = &mnemonic.to_seed(&passphrase);

        passphrase.zeroize();

        Ok(VecU8Pointer::new(Vec::from(seed)))
    }

    pub fn to_words(&self) -> Result<VecStringPointer, String> {
        let words: Vec<String> = self.phrase.clone().split(' ')
             .map(|word| String::from(word))
             .collect();
        Ok(new_vec_string_pointer(words))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[test]
    fn can_generate_mnemonic_from_size() {
        let mnemonic = Mnemonic::new(PhraseSize::N12)
            .expect("Should generate mnemonic of length 12");
        let split = mnemonic.phrase.split(' ');
        let words: Vec<&str> = split.collect();

        assert_eq!(words.iter().len(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::N24)
            .expect("Should generate mnemonic of length 24");
        let split = mnemonic.phrase.split(' ');
        let words: Vec<&str> = split.collect();

        assert_eq!(words.iter().len(), 24);
    }

    #[test]
    fn can_generate_seed_from_phrase() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic = Mnemonic::from_phrase(phrase.into()).unwrap();
        let seed = mnemonic.to_seed(None).expect("Should return seed from mnemonic phrase");

        assert_eq!(seed.vec.len(), 64);
    }

    #[test]
    #[should_panic]
    fn invalid_phrase_should_panic() {
        let bad_phrase = "caught pig embody hip goose like become";
        let _ = Mnemonic::from_phrase(bad_phrase.into()).expect("This should fail");
    }

    #[wasm_bindgen_test]
    fn can_generate_word_list_from_mnemonic() {
        let mnemonic = Mnemonic::new(PhraseSize::N12)
            .expect("Should generate mnemonic of length 12");
        let words = mnemonic.to_words()
            .expect("Should return a VecStringPointer containing the words");

        assert_eq!(words.strings.len(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::N24)
            .expect("Should generate mnemonic of length 24");
        let words = mnemonic.to_words()
            .expect("Should return a VecStringPointer containing the words");

        assert_eq!(words.strings.len(), 24);
    }
}

use js_sys::Array;
use wasm_bindgen::prelude::*;
use bip0039::Count;

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
    #[wasm_bindgen(constructor)]
    pub fn new(size: PhraseSize) -> Result<Mnemonic, String> {
        let count: Count = match size {
            PhraseSize::N12 => Count::Words12,
            PhraseSize::N24 => Count::Words24,
        };
        let mnemonic = bip0039::Mnemonic::generate(count);

        Ok(Mnemonic { phrase: mnemonic.to_string() })
    }

    pub fn phrase(&self) -> String {
        String::from(&self.phrase)
    }

    pub fn validate(phrase: &str) -> Result<(), String> {
        let split = &phrase.split(' ');
        let words: Vec<&str> = split.clone().collect();

        if words.len() != PhraseSize::N12 as usize
            && words.len() != PhraseSize::N24 as usize {
            return Err("Invalid mnemonic phrase!".into());
        }

        Ok(())
    }

    pub fn from_phrase(phrase: String) -> Result<Mnemonic, String> {
        Mnemonic::validate(&phrase)?;

        Ok(Mnemonic {
            phrase
        })
    }

    pub fn to_bytes(&self) -> Vec<u8> {
        let bytes = self.phrase.as_bytes();
        Vec::from(bytes)
    }

    pub fn to_seed(&self, passphrase: Option<String>) -> Result<Vec<u8>, String> {
        let passphrase = match passphrase {
            Some(passphrase) => passphrase,
            None => "".into(),
        };
        let mnemonic = match bip0039::Mnemonic::from_phrase(self.phrase.clone()) {
            Ok(mnemonic) => mnemonic,
            Err(_) => return Err(String::from("Unable to parse mnemonic!")),
        };
        let seed: &[u8] = &mnemonic.to_seed(&passphrase);

        Ok(Vec::from(seed))
    }

    pub fn to_words(&self) -> Result<JsValue, String> {
        let words: Array = self.phrase.clone().split(' ')
            .map(|word| JsValue::from(&word.to_string()))
            .collect();

        Ok(JsValue::from(words))
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

        assert_eq!(seed.len(), 64);
    }

    #[test]
    #[should_panic]
    fn invalid_phrase_should_panic() {
        let bad_phrase = "caught pig embody hip goose like become";
        let _ = Mnemonic::from_phrase(bad_phrase.into()).expect("This should fail");
    }

    #[wasm_bindgen_test]
    fn can_generate_word_list_from_mnemonic() {
        use js_sys::Array;
        let mnemonic = Mnemonic::new(PhraseSize::N12)
            .expect("Should generate mnemonic of length 12");
        let words = mnemonic.to_words()
            .expect("Should return JsValue array of words");

        assert_eq!(Array::from(&words).length(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::N24)
            .expect("Should generate mnemonic of length 24");
        let words = mnemonic.to_words()
            .expect("Should return JsValue array of words");

        assert_eq!(Array::from(&words).length(), 24);
    }
}

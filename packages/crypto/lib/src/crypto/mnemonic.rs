use js_sys::Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum PhraseSize {
    Twelve = 12,
    TwentyFour = 24,
}

#[wasm_bindgen]
pub struct Mnemonic {
    phrase: String,
}

#[wasm_bindgen]
impl Mnemonic {
    pub fn new(size: PhraseSize) -> Result<Mnemonic, String> {
        use rand_bip::prelude::ThreadRng;
        use rand_bip::thread_rng;
        let mut rng: ThreadRng = thread_rng();
        let mnemonic = match bip39::Mnemonic::generate_in_with(
            &mut rng, bip39::Language::English,
            size as usize,
        ) {
            Ok(mnemonic) => mnemonic,
            Err(error) => return Err(format!("Unable to generate mnemonic! {:?}", error)),
        };

        Ok(Mnemonic { phrase: mnemonic.to_string() })
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

    pub fn to_seed(&self, passphrase: Option<String>) -> Result<Vec<u8>, String> {
        let passphrase = match passphrase {
            Some(passphrase) => passphrase,
            None => "".into(),
        };
        let mnemonic = match bip39::Mnemonic::parse(&self.phrase) {
            Ok(mnemonic) => mnemonic,
            Err(error) => return Err(format!("Unable to parse mnemonic! {:?}", error)),
        };
        let seed: &[u8] = &mnemonic.to_seed(&passphrase);

        Ok(Vec::from(seed))
    }

    pub fn to_words(&self) -> Result<JsValue, String> {
        let mnemonic = match bip39::Mnemonic::parse(&self.phrase) {
            Ok(mnemonic) => mnemonic,
            Err(error) => return Err(format!("Unable to parse mnemonic! {:?}", error)),
        };

        #[allow(clippy::redundant_closure)]
        Ok(JsValue::from(mnemonic.word_iter()
            .map(|word| JsValue::from(word))
            .collect::<Array>()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_generate_mnemonic_from_size() {
        let mnemonic = Mnemonic::new(PhraseSize::Twelve)
            .expect("Should generate mnemonic of length 12");
        let split = mnemonic.phrase.split(' ');
        let words: Vec<&str> = split.collect();

        assert_eq!(words.iter().len(), 12);

        let mnemonic = Mnemonic::new(PhraseSize::TwentyFour)
            .expect("Should generate mnemonic of length 24");
        let split = mnemonic.phrase.split(' ');
        let words: Vec<&str> = split.collect();

        assert_eq!(words.iter().len(), 24);
    }

    #[test]
    fn can_generate_seed_from_phrase() {
        let phrase = "caught pig embody hip goose like become worry face oval manual flame \
                      pizza steel viable proud eternal speed chapter sunny boat because view bullet";
        let mnemonic = Mnemonic::from_phrase(phrase.into());
        let seed = mnemonic.to_seed(None).expect("Should return seed from mnemonic phrase");

        assert_eq!(seed.len(), 64);
    }
}

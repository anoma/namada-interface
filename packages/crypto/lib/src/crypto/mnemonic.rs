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
        let mnemonic = match bip39::Mnemonic::parse_in_normalized(
            bip39::Language::English,
            &self.phrase,
        ) {
            Ok(mnemonic) => mnemonic,
            Err(error) => return Err(format!("Unable to parse mnemonic! {:?}", error)),
        };
        let seed = mnemonic.to_seed_normalized(&passphrase);

        Ok(Vec::from(seed))
    }
}

use std::convert::{TryFrom, TryInto};
use anoma::types::key::ed25519::{
    Keypair as NativeKeypair,
    PublicKey as NativePublicKey,
    Signature as NativeSignature,
};
use borsh::{BorshDeserialize, BorshSerialize};
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

#[allow(dead_code)]
#[wasm_bindgen]
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

impl TryFrom<JsValue> for Keypair {
    type Error = JsValue;

    fn try_from(value: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(value).map_err(|err| JsValue::from_str(&err.to_string()))
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
    pub fn serialize(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self).unwrap()
    }

    #[wasm_bindgen]
    pub fn deserialize(js_data: JsValue) -> Result<Keypair, JsValue> {
        serde_wasm_bindgen::from_value(js_data).map_err(|err| JsValue::from_str(&err.to_string()))
    }

    #[wasm_bindgen]
    pub fn to_bytes(self) -> Box<[u8]> {
        Box::new(self.0.to_bytes())
    }
}

#[wasm_bindgen]
pub struct Signature(NativeSignature);

#[wasm_bindgen]
impl Signature {
    #[wasm_bindgen]
    pub fn serialize(&self) -> Vec<u8> {
        self.0.try_to_vec().unwrap()
    }

    #[wasm_bindgen]
    pub fn deserialize(encoded: &[u8]) -> Result<Signature, JsValue> {
        BorshDeserialize::try_from_slice(&encoded)
            .map(Signature)
            .map_err(|_| JsValue::from_str("Error deserializing signature"))
    }
}

#[allow(dead_code)]
#[wasm_bindgen]
pub fn sign(serialized_keypair: JsValue, data: &[u8]) -> Result<Vec<u8>, JsValue> {
    use anoma::types::key::ed25519::sign;

    let keypair: Keypair = serialized_keypair.try_into()?;

    Ok(Signature(sign(&keypair.0, data)).serialize())
}

#[allow(dead_code)]
#[wasm_bindgen]
pub fn verify_signature(
    pk: &PublicKey,
    data: &[u8],
    signature_bytes: &[u8],
) -> Result<(), JsValue> {
    use anoma::types::key::ed25519::verify_signature_raw;

    let Signature(signature) = Signature::deserialize(signature_bytes)?;

    verify_signature_raw(&pk.0, data, &signature).map_err(|err| JsValue::from_str(&err.to_string()))
}

#[cfg(test)]
pub mod test_keypair {
    use wasm_bindgen_test::*;
    use super::{PhraseSize, Keypair};
    use super::generate_mnemonic;

    #[wasm_bindgen_test]
    fn key_derivation_is_deterministic() {
        let phrase = generate_mnemonic(PhraseSize::N12);
        let keypair = Keypair::from_mnemonic(&phrase, 1).to_bytes();
        let again = Keypair::from_mnemonic(&phrase, 1).to_bytes();

        assert_eq!(keypair, again);

        let keypair = Keypair::from_mnemonic(&phrase, 10).to_bytes();
        let again = Keypair::from_mnemonic(&phrase, 10).to_bytes();

        assert_eq!(keypair, again);
    }

    #[wasm_bindgen_test]
    fn serialization_works_correctly() {
        let phrase = generate_mnemonic(PhraseSize::N12);
        let keypair = Keypair::from_mnemonic(&phrase, 1);
        let serialized = keypair.serialize();
        let deserialized = Keypair::deserialize(serialized).unwrap();

        assert_eq!(keypair.0.secret.to_string(), deserialized.0.secret.to_string());
        assert_eq!(keypair.0.public.to_string(), deserialized.0.public.to_string());
    }
}

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub enum ByteSize {
    N12 = 12,
    N24 = 24,
    N32 = 32,
}

#[wasm_bindgen]
pub struct Rng;

#[wasm_bindgen]
impl Rng {
    pub fn generate_bytes(size: Option<ByteSize>) -> Result<Vec<u8>, String> {
        let size = match size {
            Some(ByteSize::N12) => 12,
            Some(ByteSize::N24) => 24,
            Some(ByteSize::N32) => 32,
            None => 32,
        };

        let mut buf = [0u8; 32];
        getrandom::getrandom(&mut buf).map_err(|err| err.to_string())?;

        let buf = Vec::from(buf);

        Ok(Vec::from(&buf[0..size]))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_bytes() {
        let bytes =
            Rng::generate_bytes(Some(ByteSize::N12)).expect("Generating 12 bytes should not fail");

        assert_eq!(bytes.len(), 12);

        let bytes =
            Rng::generate_bytes(Some(ByteSize::N24)).expect("Generating 24 bytes should not fail");

        assert_eq!(bytes.len(), 24);

        let bytes =
            Rng::generate_bytes(Some(ByteSize::N32)).expect("Generating 32 bytes should not fail");

        assert_eq!(bytes.len(), 32);
    }
}

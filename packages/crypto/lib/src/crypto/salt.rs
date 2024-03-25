use password_hash::{rand_core::OsRng, SaltString};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Salt {
    salt: SaltString,
}

#[wasm_bindgen]
impl Salt {
    #[wasm_bindgen(constructor)]
    pub fn new(salt: String) -> Result<Salt, String> {
        let salt = SaltString::new(&salt).map_err(|err| err.to_string())?;

        Ok(Salt { salt })
    }

    pub fn generate() -> Self {
        Self {
            salt: SaltString::generate(&mut OsRng),
        }
    }

    pub fn to_bytes(&self) -> Result<Vec<u8>, String> {
        let salt_string = &self.salt.to_string();
        let salt = argon2::password_hash::Salt::new(salt_string).map_err(|err| err.to_string())?;
        let bytes: &[u8] = salt.as_bytes();
        Ok(Vec::from(bytes))
    }

    pub fn as_string(&self) -> String {
        self.salt.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_generate_salt_from_string() {
        let salt_string = String::from("41oVKhMIBZ+oF4efwq7e0A");
        let salt =
            Salt::new(salt_string.clone()).expect("Creating instance of Salt should not fail!");

        assert_eq!(salt_string, salt.as_string());
    }

    #[wasm_bindgen_test]
    fn can_generate_salt_bytes_from_string() {
        let salt = String::from("41oVKhMIBZ+oF4efwq7e0A");
        let salt = Salt::new(salt).expect("Creating salt from string should not fail");
        let expected_bytes = vec![
            52, 49, 111, 86, 75, 104, 77, 73, 66, 90, 43, 111, 70, 52, 101, 102, 119, 113, 55, 101,
            48, 65,
        ];
        let bytes = salt.to_bytes().expect("Returning to bytes should not fail");
        assert_eq!(bytes, expected_bytes);
    }
}

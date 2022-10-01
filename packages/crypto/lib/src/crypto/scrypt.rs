use scrypt::{
    self,
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
    },
};
use serde::{Serialize, Deserialize};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct ScryptParams {
    log_n: u8,
    r: u32,
    p: u32,
}

#[wasm_bindgen]
impl ScryptParams {
    #[wasm_bindgen(constructor)]
    pub fn new(log_n: u8, r: u32, p: u32) -> Self {
        Self {
            log_n,
            r,
            p,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct Serialized {
    key: Vec<u8>,
    salt: String,
    params: ScryptParams,
}

#[wasm_bindgen]
pub struct Scrypt {
    password: Vec<u8>,
    salt: SaltString,
    params: scrypt::Params,
}

/// Scrypt password hashing
#[wasm_bindgen]
impl Scrypt {
    #[wasm_bindgen(constructor)]
    pub fn new(
        password: String,
        salt: Option<String>,
        params: Option<ScryptParams>,
    ) -> Result<Scrypt, String> {
        let bytes: &[u8] = password.as_bytes();
        let default_params = scrypt::Params::recommended();

        let salt = match salt {
            Some(salt) => SaltString::new(&salt)
                .map_err(|err| err.to_string())?,
            None => SaltString::generate(&mut OsRng),
        };

        let params = match params {
            Some(params) => params,
            None => ScryptParams::new(
                default_params.log_n(),
                default_params.r(),
                default_params.p(),
            ),
        };

        let params = scrypt::Params::new(
            params.log_n,
            params.r,
            params.p,
        ).unwrap();

        Ok(Scrypt {
            password: Vec::from(bytes),
            salt,
            params,
        })
    }

    pub fn to_hash(&self) -> Result<String, String> {
        let bytes: &[u8] = &self.password;

        // Hash password to PHC string ($scrypt$...)
        let password_hash = scrypt::Scrypt
            .hash_password_customized(
                bytes,
                None,
                None,
                self.params,
                &self.salt,
            ).map_err(|err| err.to_string())?.to_string();

        Ok(password_hash)
    }

    pub fn verify(&self, hash: String) -> Result<(), String> {
        let bytes: &[u8] = &self.password;
        let parsed_hash = PasswordHash::new(&hash).
            map_err(|err| err.to_string())?;

        match scrypt::Scrypt.verify_password(bytes, &parsed_hash) {
            Ok(_) => Ok(()),
            Err(err) => Err(err.to_string()),
        }
    }

    /// Convert PHC string to serialized key + params
    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let hash = self.to_hash()?;
        let split = hash.split('$');
        let items: Vec<&str> = split.collect();

        let key = items[items.len() - 1];

        Ok(JsValue::from_serde(&Serialized {
            key: Vec::from(key.as_bytes()),
            salt: String::from(self.salt.as_str()),
            params: ScryptParams::new(
                self.params.log_n(),
                self.params.r(),
                self.params.p(),
            ),
        }).expect("Should be able to serialize into JsValue"))
    }

    pub fn params(&self) -> Result<JsValue, String> {
        let params = self.params;

        // Return serialized parameters
        Ok(JsValue::from_serde(&ScryptParams::new(
            params.log_n(),
            params.r(),
            params.p(),
        )).expect("Should be able to serialize into JsValue"))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[test]
    fn can_hash_password() {
        let password = "unhackable";
        // Run with default, recommended params:
        // Iterations: log_n = 15 (n = 32768)
        // Block size: r = 8
        // Threads in parallel: p = 1
        let scrypt = Scrypt::new(password.into(), None, None)
            .expect("Instance should be able to be created with default params");
        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());
    }

    #[test]
    fn can_verify_stored_hash() {
        let password = "unhackable";
        let scrypt = Scrypt::new(password.into(), None, None)
            .expect("Instance should be able to be created with default params");

        // A previously defined hash using the same password.
        // Two hashes created with the same password should not be equal, but should
        // be able to be verified with the same password (as we are using random salts):
        let stored_hash = "$scrypt$ln=15,r=8,p=1$8tCIIPY6IHOer0WBjPr9OQ$PuKRj3Nfv+Mt47FljIRgmXyQnaH3Yh1eBwVq63rNTME";

        assert_ne!(scrypt.to_hash().unwrap(), stored_hash);
        assert!(scrypt.verify(stored_hash.to_string()).is_ok());
    }

    #[test]
    fn can_hash_password_with_custom_params() {
        let password = "unhackable";
        // Iteratons count - log(n)
        let log_n: u8 = 12;
        // Block size
        let r: u32 = 12;
        // Threads to run in parallel
        let p: u32 = 2;
        let params = ScryptParams::new(log_n, r, p);

        let scrypt = Scrypt::new(password.into(), None, Some(params))
            .expect("Instance should be able to be created with custom params");

        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());
    }

    #[wasm_bindgen_test]
    fn can_serialize_params_to_js_value() {
        let password = "unhackable";
        let scrypt = Scrypt::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());

        let params: ScryptParams = JsValue::into_serde(&scrypt.params().unwrap())
            .expect("Should be able to serialize parameters to JsValue");

        assert_eq!(params.log_n, 15);
        assert_eq!(params.r, 8);
        assert_eq!(params.p, 1);
    }

    #[wasm_bindgen_test]
    fn can_serialize_to_js_value() {
        let password = "unhackable";
        let scrypt = Scrypt::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());

        let serialized: Serialized = JsValue::into_serde(&scrypt.to_serialized().unwrap())
            .expect("Should be able to serialize parameters to JsValue");

        assert_eq!(serialized.params.log_n, 15);
        assert_eq!(serialized.params.r, 8);
        assert_eq!(serialized.params.p, 1);
        assert_eq!(serialized.key.len(), 43);
    }
}

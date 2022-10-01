use argon2::{
    self,
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Params,
};
use serde::{Serialize, Deserialize};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Argon2Params {
    m_cost: u32,
    t_cost: u32,
    p_cost: u32,
}

#[wasm_bindgen]
impl Argon2Params {
    #[wasm_bindgen(constructor)]
    pub fn new(m_cost: u32, t_cost: u32, p_cost: u32) -> Self {
        Self {
            m_cost,
            t_cost,
            p_cost,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct Serialized {
    salt: String,
    key: Vec<u8>,
    params: Argon2Params,
}

#[wasm_bindgen]
pub struct Argon2 {
    salt: SaltString,
    password: Vec<u8>,
    params: argon2::Params,
}

/// Argon2 password hashing
#[wasm_bindgen]
impl Argon2 {
    #[wasm_bindgen(constructor)]
    pub fn new(
        password: String,
        salt: Option<String>,
        params: Option<Argon2Params>,
    ) -> Result<Argon2, String> {
        let password = Vec::from(password.as_bytes());
        let default_params = Params::default();

        let salt = match salt {
            Some(salt) => SaltString::new(&salt)
                .map_err(|err| err.to_string())?,
            None => SaltString::generate(&mut OsRng),
        };

        let params = match params {
            Some(params) => params,
            None => Argon2Params::new(
                default_params.m_cost(),
                default_params.t_cost(),
                default_params.p_cost(),
            ),
        };

        let params = Params::new(
            params.m_cost,
            params.t_cost,
            params.p_cost,
            None,
        ).map_err(|err| err.to_string())?;

        Ok(Argon2 {
            salt,
            password,
            params,
        })
    }

    pub fn to_hash(&self) -> Result<String, String> {
        let argon2 = argon2::Argon2::default();
        let bytes: &[u8] = &self.password;
        let params = &self.params;

        // Hash password to PHC string ($argon2id$v=19$...)
        let password_hash = argon2.hash_password_customized(
            bytes,
            None, // Default alg_id = Argon2id
            None, // Default ver = v19
            params.to_owned(),
            &self.salt,
        ).map_err(|err| err.to_string())?.to_string();

        Ok(password_hash)
    }

    pub fn verify(&self, hash: String) -> Result<(), String> {
        let argon2 = argon2::Argon2::default();
        let bytes: &[u8] = &self.password;
        let parsed_hash = PasswordHash::new(&hash).
            map_err(|err| err.to_string())?;

        match argon2.verify_password(bytes, &parsed_hash) {
            Ok(_) => Ok(()),
            Err(err) => Err(err.to_string()),
        }
    }

    pub fn params(&self) -> Result<JsValue, String> {
        let params = &self.params;

        // Return serialized parameters
        Ok(JsValue::from_serde(&Argon2Params::new(
            params.m_cost(),
            params.t_cost(),
            params.p_cost(),
        )).expect("Should be able to serialize into JsValue"))
    }

    /// Convert PHC string to serialized key + params
    pub fn to_serialized(&self) -> Result<JsValue, String> {
        let hash = self.to_hash()?;
        let split = hash.split('$');
        let items: Vec<&str> = split.collect();

        let key = items[items.len() - 1];

        Ok(JsValue::from_serde(&Serialized {
            salt: String::from(self.salt.as_str()),
            key: Vec::from(key.as_bytes()),
            params: Argon2Params::new(
                self.params.m_cost(),
                self.params.t_cost(),
                self.params.p_cost(),
            ),
        }).expect("Should be able to serialize into JsValue"))
    }

    pub fn salt(&self) -> String {
        String::from(self.salt.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::crypto::salt::Salt;
    use wasm_bindgen_test::*;

    #[test]
    fn can_hash_password() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());
    }

    #[test]
    fn can_hash_password_with_custom_params() {
        // Memory cost
        let m_cost = 2048;
        // Iterations/Time cost:
        let t_cost = 2;
        // Degree of parallelism:
        let p_cost = 2;
        let params = Argon2Params::new(m_cost, t_cost, p_cost);
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, Some(params))
            .expect("Creating instance with custom params should not fail");

        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");
        assert!(argon2.verify(hash).is_ok());
    }

    #[test]
    fn can_verify_stored_hash() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let stored_hash = "$argon2id$v=19$m=4096,t=3,p=1$0UUjc4ZBOJJLTPrS1mQr1w$orbgGGRzWC0GvplgJuteaDORldnQiJfVumhXSuwO3UE";

        // With randomly generated salt, this should not create
        // an equivalent hash:
        assert_ne!(argon2.to_hash().unwrap(), stored_hash);
        assert!(argon2.verify(stored_hash.to_string()).is_ok());
    }

    #[test]
    fn can_verify_stored_hash_with_custom_salt() {
        let password = "unhackable";
        let salt = String::from("41oVKhMIBZ+oF4efwq7e0A");
        let argon2 = Argon2::new(password.into(), Some(salt), None)
            .expect("Creating instance with default params should not fail");
        let stored_hash = "$argon2id$v=19$m=4096,t=3,p=1$41oVKhMIBZ+oF4efwq7e0A$ec9kY153e/S6z9awayWdUTLdaQowoAxrdo7ZkTjhBl4";

        // Providing salt, this should create an equivalent hash:
        assert_eq!(argon2.to_hash().unwrap(), stored_hash);
        assert!(argon2.verify(stored_hash.to_string()).is_ok());
    }

    #[test]
    fn can_generate_salt_from_string() {
        let salt = String::from("41oVKhMIBZ+oF4efwq7e0A");
        let password = String::from("unhackable");
        let argon2 = Argon2::new(password, Some(salt.clone()), None)
            .expect("Creating instance of Argon2 should not fail!");

        assert_eq!(salt, argon2.salt());
    }

    #[test]
    fn can_generate_salt_bytes_from_string() {
        let salt = String::from("41oVKhMIBZ+oF4efwq7e0A");
        let salt = Salt::new(salt).expect("Creating salt from string should not fail");
        let expected_bytes = vec![52, 49, 111, 86, 75, 104, 77, 73, 66, 90, 43,
                                  111, 70, 52, 101, 102, 119, 113, 55, 101, 48, 65];
        let bytes = salt.to_bytes().expect("Returning to bytes should not fail");
        assert_eq!(bytes, expected_bytes);
    }

    #[wasm_bindgen_test]
    fn can_serialize_params_to_js_value() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());

        let params: Argon2Params = JsValue::into_serde(&argon2.params().unwrap())
            .expect("Should be able to serialize parameters to JsValue");

        assert_eq!(params.m_cost, 4096);
        assert_eq!(params.t_cost, 3);
        assert_eq!(params.p_cost, 1);
    }

    #[wasm_bindgen_test]
    fn can_serialize_to_js_value() {
        let password = "unhackable";
        let scrypt = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());

        let serialized: Serialized = JsValue::into_serde(&scrypt.to_serialized().unwrap())
            .expect("Should be able to serialize parameters to JsValue");

        assert_eq!(serialized.params.m_cost, 4096);
        assert_eq!(serialized.params.t_cost, 3);
        assert_eq!(serialized.params.p_cost, 1);
        assert_eq!(serialized.key.len(), 43);
    }
}

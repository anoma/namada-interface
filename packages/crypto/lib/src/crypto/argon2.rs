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

#[wasm_bindgen]
pub struct Argon2 {
    password: Vec<u8>,
    params: argon2::Params,
}

/// Argon2 password hashing
#[wasm_bindgen]
impl Argon2 {
    #[wasm_bindgen(constructor)]
    pub fn new(
        password: String,
        m_cost: Option<u32>,
        t_cost: Option<u32>,
        p_cost: Option<u32>,
    ) -> Result<Argon2, String> {
        let password = Vec::from(password.as_bytes());
        let default_params = Params::default();

        let m_cost = match m_cost {
            Some(m_cost) => m_cost,
            None => default_params.m_cost(),
        };

        let t_cost = match t_cost {
            Some(t_cost) => t_cost,
            None => default_params.t_cost(),
        };

        let p_cost = match p_cost {
            Some(p_cost) => p_cost,
            None => default_params.p_cost(),
        };

        let params = Params::new(m_cost, t_cost, p_cost, None)
            .map_err(|err| err.to_string())?;

        Ok(Argon2 {
            password,
            params,
        })
    }

    pub fn to_hash(&self) -> Result<String, String> {
        let salt = SaltString::generate(&mut OsRng);
        // Argon2 with default params (Argon2id v19)
        let argon2 = argon2::Argon2::default();
        let bytes: &[u8] = &self.password;
        let params = &self.params;

        // Hash password to PHC string ($argon2id$v=19$...)
        let password_hash = argon2.hash_password_customized(
            bytes,
            None, // Default alg_id = Argon2id
            None, // Default ver = v19
            params.to_owned(),
            &salt,
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[test]
    fn can_hash_password() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());
    }

    #[test]
    fn can_hash_password_with_custom_params() {
        let m_cost = 2048;
        let t_cost = 2;
        let p_cost = 2;
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), Some(m_cost), Some(t_cost), Some(p_cost))
            .expect("Creating instance with custom params should not fail");

        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");
        assert!(argon2.verify(hash).is_ok());
    }

    #[test]
    fn can_verify_stored_hash() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None, None)
            .expect("Creating instance with default params should not fail");
        let stored_hash = "$argon2id$v=19$m=4096,t=3,p=1$0UUjc4ZBOJJLTPrS1mQr1w$orbgGGRzWC0GvplgJuteaDORldnQiJfVumhXSuwO3UE";

        assert_ne!(argon2.to_hash().unwrap(), stored_hash);
        assert!(argon2.verify(stored_hash.to_string()).is_ok());
    }

    #[wasm_bindgen_test]
    fn can_serialize_params_to_js_value() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2.to_hash().expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());

        let params: Argon2Params = JsValue::into_serde(&argon2.params().unwrap())
            .expect("Should be able to serialize parameters to JsValue");

        assert_eq!(params.m_cost, 4096);
        assert_eq!(params.t_cost, 3);
        assert_eq!(params.p_cost, 1);
    }
}

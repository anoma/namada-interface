use crate::crypto::pointer_types::VecU8Pointer;
use password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString};
use wasm_bindgen::prelude::*;
use zeroize::{Zeroize, ZeroizeOnDrop};

#[wasm_bindgen]
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

    #[wasm_bindgen(getter)]
    pub fn m_cost(&self) -> u32 {
        self.m_cost
    }

    #[wasm_bindgen(getter)]
    pub fn t_cost(&self) -> u32 {
        self.t_cost
    }

    #[wasm_bindgen(getter)]
    pub fn p_cost(&self) -> u32 {
        self.p_cost
    }
}

#[wasm_bindgen]
#[derive(ZeroizeOnDrop)]
pub struct Argon2 {
    #[zeroize(skip)]
    salt: SaltString,
    password: Vec<u8>,
    #[zeroize(skip)]
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
        let default_params = argon2::Params::default();

        let salt = match salt {
            Some(salt) => SaltString::new(&salt).map_err(|err| err.to_string())?,
            None => SaltString::generate(&mut OsRng),
        };

        let params = match params {
            Some(params) => argon2::Params::new(params.m_cost, params.t_cost, params.p_cost, None)
                .map_err(|err| err.to_string())?,
            None => default_params,
        };

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
        let password_hash = argon2
            .hash_password_customized(
                bytes,
                None, // Default alg_id = Argon2id
                None, // Default ver = v19
                params.to_owned(),
                &self.salt,
            )
            .map_err(|err| err.to_string())?
            .to_string();

        Ok(password_hash)
    }

    pub fn verify(&self, hash: String) -> Result<(), String> {
        let argon2 = argon2::Argon2::default();
        let bytes: &[u8] = &self.password;
        let parsed_hash = PasswordHash::new(&hash).map_err(|err| err.to_string())?;

        match argon2.verify_password(bytes, &parsed_hash) {
            Ok(_) => Ok(()),
            Err(err) => Err(err.to_string()),
        }
    }

    pub fn params(&self) -> Argon2Params {
        Argon2Params::new(
            self.params.m_cost(),
            self.params.t_cost(),
            self.params.p_cost(),
        )
    }

    /// Convert PHC string to serialized key
    pub fn key(&self) -> Result<VecU8Pointer, String> {
        let mut hash = self.to_hash()?;
        let split = hash.split('$');
        let items: Vec<&str> = split.collect();

        let key = items[items.len() - 1];
        let vec = Vec::from(key.as_bytes());
        hash.zeroize();

        Ok(VecU8Pointer::new(vec))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    #[wasm_bindgen_test]
    fn can_hash_password() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2
            .to_hash()
            .expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());
    }

    #[wasm_bindgen_test]
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

        let hash = argon2
            .to_hash()
            .expect("Hashing password with Argon2 should not fail!");
        assert!(argon2.verify(hash).is_ok());
    }

    #[wasm_bindgen_test]
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

    #[wasm_bindgen_test]
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

    #[wasm_bindgen_test]
    fn can_get_key_and_params() {
        let password = "unhackable";
        let argon2 = Argon2::new(password.into(), None, None)
            .expect("Creating instance with default params should not fail");
        let hash = argon2
            .to_hash()
            .expect("Hashing password with Argon2 should not fail!");

        assert!(argon2.verify(hash).is_ok());

        let params = argon2.params();
        let key = argon2.key().expect("Creating key should not fail");

        assert_eq!(params.m_cost(), 4096);
        assert_eq!(params.t_cost(), 3);
        assert_eq!(params.p_cost(), 1);
        assert_eq!(key.vec.len(), 43);
    }
}

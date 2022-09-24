/// Scrypt password hashing
use scrypt::{
    self,
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Params,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Scrypt {
    password: Vec<u8>,
    params: Params,
}

#[wasm_bindgen]
impl Scrypt {
    // TODO: Implement default params on new, and separate
    // constructor with custom params
    #[wasm_bindgen(constructor)]
    pub fn new(
        password: String,
        log_n: Option<u8>,
        r: Option<u32>,
        p: Option<u32>,
    ) -> Result<Scrypt, String> {
        let bytes: &[u8] = password.as_bytes();
        let default_params = Params::recommended();

        let log_n = match log_n {
            Some(log_n) => log_n,
            None => default_params.log_n(),
        };

        let r = match r {
            Some(r) => r,
            None => default_params.r(),
        };

        let p = match p {
            Some(p) => p,
            None => default_params.p(),
        };

        let params = Params::new(log_n, r, p)
            .map_err(|err| err.to_string())?;

        Ok(Scrypt {
            password: Vec::from(bytes),
            params,
        })
    }

    pub fn to_hash(&self) -> Result<String, String> {
        let salt = SaltString::generate(&mut OsRng);
        let bytes: &[u8] = &self.password;

        // TODO: Implement using default or custom params
        // Hash password to PHC string ($scrypt$...)
        let password_hash = scrypt::Scrypt.hash_password(bytes, &salt).
            map_err(|err| err.to_string())?.to_string();

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

    pub fn log_n(&self) -> u8 {
        self.params.log_n()
    }

    pub fn r(&self) -> u32 {
        self.params.r()
    }

    pub fn p(&self) -> u32 {
        self.params.p()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    // use wasm_bindgen_test::*;

    #[test]
    fn can_hash_with_scrypt() {
        let password = "unhackable";
        let scrypt = Scrypt::new(password.into(), None, None, None)
            .expect("Instance should be able to be created with default params");

        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());
    }
}

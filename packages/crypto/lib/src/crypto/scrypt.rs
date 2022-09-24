use scrypt::{
    self,
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
    },
    Params,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Scrypt {
    password: Vec<u8>,
    params: Params,
}

/// Scrypt password hashing
#[wasm_bindgen]
impl Scrypt {
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

        // Hash password to PHC string ($scrypt$...)
        let password_hash = scrypt::Scrypt
            .hash_password_customized(
                bytes,
                None,
                None,
                self.params,
                &salt,
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

    #[test]
    fn can_hash_password() {
        let password = "unhackable";
        // Run with default, recommended params:
        // Iterations: log_n = 15 (n = 32768)
        // Block size: r = 8
        // Threads in parallel: p = 1
        let scrypt = Scrypt::new(password.into(), None, None, None)
            .expect("Instance should be able to be created with default params");
        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());
    }

    #[test]
    fn can_verify_stored_hash() {
        let password = "unhackable";
        let scrypt = Scrypt::new(password.into(), None, None, None)
            .expect("Instance should be able to be created with default params");

        // A previously defined hash using the same password.
        // Two hashes created with the same password should not be equal, but should
        // be able to be verified with the same password:
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

        let scrypt = Scrypt::new(password.into(), Some(log_n), Some(r), Some(p))
            .expect("Instance should be able to be created with custom params");

        let hash = scrypt.to_hash().expect("Hashing password with Scrypt should not fail!");

        assert!(scrypt.verify(hash).is_ok());
    }
}

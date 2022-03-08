use anoma::types::key::ed25519::Keypair;
use borsh::{BorshDeserialize, BorshSerialize};
use orion::{aead, kdf};
use thiserror::Error;

#[allow(missing_docs)]
#[derive(Debug, Error)]
pub enum DecryptionError {
    #[error("Unexpected encryption salt")]
    BadSalt,
    #[error("Unable to decrypt the keypair. Is the password correct?")]
    DecryptionError,
    #[error("Unable to deserialize the keypair")]
    DeserializingError,
}

/// An encrypted keypair stored in a wallet
#[derive(Debug)]
pub struct EncryptedKeypair(pub Vec<u8>);

impl EncryptedKeypair {
    /// Encrypt a keypair and store it with its salt.
    pub fn encrypt(keypair: &Keypair, password: String) -> Self {
        let salt = encryption_salt();
        let encryption_key = encryption_key(&salt, password);

        let data = keypair
            .try_to_vec()
            .expect("Serializing keypair shouldn't fail");

        let encrypted_keypair =
            aead::seal(&encryption_key, &data).expect("Encryption of data shouldn't fail");

        let encrypted_data = [salt.as_ref(), &encrypted_keypair].concat();

        Self(encrypted_data)
    }

    /// Decrypt an encrypted keypair
    pub fn decrypt(&self, password: String) -> Result<Keypair, DecryptionError> {
        let salt_len = encryption_salt().len();
        let (raw_salt, cipher) = self.0.split_at(salt_len);

        let salt = kdf::Salt::from_slice(raw_salt).map_err(|_| DecryptionError::BadSalt)?;

        let encryption_key = encryption_key(&salt, password);

        let decrypted_data =
            aead::open(&encryption_key, cipher).map_err(|_| DecryptionError::DecryptionError)?;

        Keypair::try_from_slice(&decrypted_data).map_err(|_| DecryptionError::DeserializingError)
    }
}

/// Keypair encryption salt
pub fn encryption_salt() -> kdf::Salt {
    kdf::Salt::default()
}

/// Make encryption secret key from a password.
pub fn encryption_key(salt: &kdf::Salt, password: String) -> kdf::SecretKey {
    kdf::Password::from_slice(password.as_bytes())
        .and_then(|password| kdf::derive_key(&password, salt, 3, 1 << 16, 32))
        .expect("Generation of encryption secret key shouldn't fail")
}

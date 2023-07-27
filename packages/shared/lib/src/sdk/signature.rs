use borsh::{BorshDeserialize, BorshSerialize};
use namada::proto::{Signature, Tx};
use wasm_bindgen::JsError;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SignatureMsg {
    salt: Vec<u8>,
    indices: Vec<u8>,
    pubkey: Vec<u8>,
    signature: Vec<u8>,
}

/// Reconstructs a proto::Signature using the provided indices to retrieve hashes from Tx
///
/// # Arguments
////
/// * `sig_msg` - A Borshed serialized SignatureMsg struct
/// * `tx` - A proto::Tx
///
/// # Errors
///
/// Returns JsError if the sig_msg can't be deserialized or
/// Rust structs can't be created.
pub fn construct_signature(sig_msg: &[u8], tx: &Tx) -> Result<Signature, JsError> {
    let sig_msg = SignatureMsg::try_from_slice(sig_msg).map_err(JsError::from)?;

    let SignatureMsg {
        salt,
        indices,
        pubkey,
        signature,
    } = sig_msg;

    // Signature section bytes start with salt
    let mut sig = salt;
    let mut public_key = pubkey;
    let mut signature = signature;

    // Which is followed the number of sections
    let mut indices_length = vec![indices.len() as u8, 0, 0, 0];
    sig.append(&mut indices_length);

    // Which is followed by the hash of each section in the order specified
    for i in 0..indices.len() {
        let sechash = match indices[i] {
            0 => tx.header_hash(),
            _ => tx.sections[indices[i] as usize - 1].get_hash(),
        };

        sig.append(&mut sechash.to_vec());
    }

    // Which is followed by the public key of the signer
    sig.append(&mut public_key);

    // Indicates that a signature follows
    sig.append(&mut vec![0x01]);

    // Followed by the signature
    sig.append(&mut signature);

    Ok(Signature::try_from_slice(&sig).map_err(JsError::from)?)
}

use borsh::{BorshDeserialize, BorshSerialize};
use namada::proto::{MultiSignature, Section, Signature, Tx};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, BorshSerialize, BorshDeserialize)]
pub enum SignatureType {
    Raw = 0,
    Wrapper = 1,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SignatureMsg {
    sec_indices: Vec<u8>,
    singlesig: Vec<u8>,
    sig_type: SignatureType,
    multisig_indices: Vec<u8>,
    multisig: Vec<u8>,
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
pub fn construct_signature(sig_msg: &[u8], tx: &Tx) -> Result<Section, JsError> {
    let sig_msg = SignatureMsg::try_from_slice(sig_msg)?;

    let SignatureMsg {
        sec_indices,
        singlesig,
        sig_type,
        multisig_indices,
        multisig,
    } = sig_msg;

    // Which is followed the number of sections
    let indices_length = vec![sec_indices.len() as u8, 0, 0, 0];
    let mut sig = indices_length;

    // Which is followed by the hash of each section in the order specified
    for i in 0..sec_indices.len() {
        let sechash = match sec_indices[i] {
            0 => tx.header_hash(),
            _ => tx.sections[sec_indices[i] as usize - 1].get_hash(),
        };

        sig.extend_from_slice(&sechash.to_vec());
    }

    match sig_type {
        SignatureType::Wrapper => {
            // Indicates that a signature follows
            sig.extend_from_slice(&vec![0x01]);

            // Followed by the signature
            sig.extend_from_slice(&singlesig);
            Ok(Section::Signature(Signature::try_from_slice(&sig)?))
        }
        SignatureType::Raw => {
            // Multisigs start with the number of signatures
            sig.extend_from_slice(&vec![multisig_indices.len() as u8, 0, 0, 0]);
            // Followed by a sequence of signature - index pairs
            for (signature, idx) in multisig.iter().zip(multisig_indices) {
                // Add the bytes of the signature
                sig.extend_from_slice(&signature.try_to_vec()?);
                // Add a byte representing the index of the signature
                sig.push(idx);
            }
            Ok(Section::SectionSignature(MultiSignature::try_from_slice(
                &sig,
            )?))
        }
    }
}

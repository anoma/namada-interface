// use borsh::{BorshDeserialize, BorshSerialize};
// use namada::{
//     ledger::pos::common::Signature,
//     proto::{CompressedSignature, Section, Signer, Tx},
//     types::key::common::PublicKey,
// };
// use std::collections::BTreeMap;
// use wasm_bindgen::JsError;
//
// #[derive(BorshSerialize, BorshDeserialize)]
// pub struct SignatureMsg {
//     pub pubkey: Vec<u8>,
//     pub raw_indices: Vec<u8>,
//     pub raw_signature: Vec<u8>,
//     pub wrapper_indices: Vec<u8>,
//     pub wrapper_signature: Vec<u8>,
// }
//
// /// Reconstructs a proto::Section signature using the provided indices to retrieve hashes
// /// from Tx
// ///
// /// # Arguments
// ////
// /// * `pubkey` - Public key bytes
// /// * `sec_indices` - Indices indicating hash location
// /// * `signature` - Signature bytes
// /// * `tx` - A proto::Tx
// ///
// /// # Errors
// ///
// /// Returns JsError if the sig_msg can't be deserialized or
// /// Rust structs can't be created.
// pub fn construct_signature_section(
//     pubkey: &[u8],
//     sec_indices: &[u8],
//     signature: &[u8],
//     tx: &Tx,
// ) -> Result<Section, JsError> {
//     let signatures = BTreeMap::from([(0, Signature::try_from_slice(signature)?)]);
//
//     let compressed_signature = CompressedSignature {
//         targets: sec_indices.to_vec(),
//         signer: Signer::PubKeys(vec![PublicKey::try_from_slice(pubkey)?]),
//         signatures,
//     };
//
//     Ok(Section::Signature(compressed_signature.expand(&tx)))
// }

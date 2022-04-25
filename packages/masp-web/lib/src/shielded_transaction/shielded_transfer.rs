// use masp_primitives::transaction::{
//     amount::Amount,
//     builder::{SaplingBuilder, SaplingMetadata},
// };

// use zcash_primitives::consensus::{
//     BlockHeight,
//     NetworkUpgrade::{Canopy, Sapling},
//     Parameters, TestNetwork, TEST_NETWORK, ZIP212_GRACE_PERIOD,
// };

// pub fn create_transfer() {
//     // let mut builder = SaplingBuilder::new(TEST_NETWORK, target_height.unwrap());
//     let mut builder = SaplingBuilder::new(TEST_NETWORK, 0u32);
//     let mut tx_metadata = SaplingMetadata::empty();

//     // builder.add_spend(rng, extsk, diversifier, note, merkle_path);
//     // builder.add_output(rng, ovk, to, asset_type, value, memo);
//     builder.get_candidate_change_address();
// }

// pub fn create_shielded_transaction() -> Option<Transaction> {
//     let transaction_data = TransactionData::new();

//     let transaction = Transaction {
//         txid: TxId([0; 32]),
//         data: transaction_data,
//     };

//     Some(transaction)
// }

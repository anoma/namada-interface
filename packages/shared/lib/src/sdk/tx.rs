use std::{path::PathBuf, str::FromStr};

use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ibc::core::ics24_host::identifier::{ChannelId, PortId},
    ledger::args::{self, InputAmount},
    types::{
        address::Address,
        chain::ChainId,
        key::common::PublicKey as PK,
        key::ed25519::PublicKey,
        masp::{ExtendedSpendingKey, PaymentAddress, TransferSource, TransferTarget},
        token::{Amount, DenominatedAmount, Denomination},
        transaction::GasLimit,
    },
};
use wasm_bindgen::JsError;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct TxMsg {
    token: String,
    fee_amount: u64,
    gas_limit: u64,
    chain_id: String,
    public_key: Option<String>,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitBondMsg {
    source: String,
    validator: String,
    amount: u64,
    native_token: String,
    tx: TxMsg,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitRevealPKMsg {
    tx: TxMsg,
    public_key: String,
}

/// Maps serialized tx_msg into RevealPk args
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn reveal_pk_tx_args(tx_msg: &[u8]) -> Result<args::RevealPk, JsError> {
    let tx_msg = SubmitRevealPKMsg::try_from_slice(tx_msg)?;
    let SubmitRevealPKMsg { tx, public_key } = tx_msg;
    let public_key = PK::Ed25519(PublicKey::from_str(&public_key).map_err(JsError::from)?);

    let args = args::RevealPk {
        tx: tx_msg_into_args(tx, None)?,
        public_key,
    };

    Ok(args)
}

/// Maps serialized tx_msg into BondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn bond_tx_args(tx_msg: &[u8], password: Option<String>) -> Result<args::Bond, JsError> {
    let tx_msg = SubmitBondMsg::try_from_slice(tx_msg)?;

    let SubmitBondMsg {
        native_token,
        source,
        validator,
        amount,
        tx,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let native_token = Address::from_str(&native_token)?;
    let validator = Address::from_str(&validator)?;
    let amount = Amount::from(amount);

    let args = args::Bond {
        tx: tx_msg_into_args(tx, password)?,
        validator,
        amount,
        source: Some(source),
        native_token,
        tx_code_path: PathBuf::from("tx_bond.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitUnbondMsg {
    source: String,
    validator: String,
    amount: u64,
    tx: TxMsg,
}

/// Maps serialized tx_msg into UnbondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn unbond_tx_args(tx_msg: &[u8], password: Option<String>) -> Result<args::Unbond, JsError> {
    let tx_msg = SubmitUnbondMsg::try_from_slice(tx_msg)?;

    let SubmitUnbondMsg {
        source,
        validator,
        amount,
        tx,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let validator = Address::from_str(&validator)?;
    let amount = Amount::from(amount);

    let args = args::Unbond {
        tx: tx_msg_into_args(tx, password)?,
        validator,
        amount,
        source: Some(source),
        tx_code_path: PathBuf::from("tx_unbond.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitTransferMsg {
    tx: TxMsg,
    source: String,
    target: String,
    token: String,
    sub_prefix: Option<String>,
    amount: u64,
    native_token: String,
}

/// Maps serialized tx_msg into TransferTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn transfer_tx_args(
    tx_msg: &[u8],
    password: Option<String>,
    xsk: Option<String>,
) -> Result<args::TxTransfer, JsError> {
    let tx_msg = SubmitTransferMsg::try_from_slice(tx_msg)?;
    let SubmitTransferMsg {
        tx,
        source,
        target,
        token,
        sub_prefix,
        amount,
        native_token,
    } = tx_msg;

    let source = match Address::from_str(&source) {
        Ok(v) => Ok(TransferSource::Address(v)),
        Err(e1) => match ExtendedSpendingKey::from_str(
            &xsk.expect("Extended spending key to be present, if address type is shielded."),
        ) {
            Ok(v) => Ok(TransferSource::ExtendedSpendingKey(v)),
            Err(e2) => Err(JsError::new(&format!(
                "Can't compute the transfer source. {}, {}",
                e1, e2
            ))),
        },
    }?;

    let target = match Address::from_str(&target) {
        Ok(v) => Ok(TransferTarget::Address(v)),
        Err(e1) => match PaymentAddress::from_str(&target) {
            Ok(v) => Ok(TransferTarget::PaymentAddress(v)),
            Err(e2) => Err(JsError::new(&format!(
                "Can't compute the transfer target. {}, {}",
                e1, e2
            ))),
        },
    }?;

    let native_token = Address::from_str(&native_token)?;
    let token = Address::from_str(&token)?;
    let amount_str = amount.to_string();
    let denom_amount = DenominatedAmount::from_str(&amount_str).expect("Amount to be valid.");
    let amount = InputAmount::Unvalidated(denom_amount);

    let args = args::TxTransfer {
        tx: tx_msg_into_args(tx, password)?,
        source,
        target,
        token,
        sub_prefix,
        amount,
        native_token,
        tx_code_path: PathBuf::from("tx_transfer.wasm"),
    };
    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitIbcTransferMsg {
    tx: TxMsg,
    source: String,
    receiver: String,
    token: String,
    sub_prefix: Option<String>,
    amount: u64,
    port_id: String,
    channel_id: String,
    timeout_height: Option<u64>,
    timeout_sec_offset: Option<u64>,
}

/// Maps serialized tx_msg into IbcTransferTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn ibc_transfer_tx_args(
    tx_msg: &[u8],
    password: Option<String>,
) -> Result<args::TxIbcTransfer, JsError> {
    let tx_msg = SubmitIbcTransferMsg::try_from_slice(tx_msg)?;
    let SubmitIbcTransferMsg {
        tx,
        source,
        receiver,
        token,
        sub_prefix,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
    } = tx_msg;

    let source = Address::from_str(&source)?;
    let token = Address::from_str(&token)?;
    let amount = Amount::from(amount);
    let port_id = PortId::from_str(&port_id).expect("Port id to be valid");
    let channel_id = ChannelId::from_str(&channel_id).expect("Channel id to be valid");

    let args = args::TxIbcTransfer {
        tx: tx_msg_into_args(tx, password)?,
        source,
        receiver,
        token,
        sub_prefix,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        tx_code_path: PathBuf::from("tx_ibc.wasm"),
    };
    Ok(args)
}

/// Maps serialized tx_msg into Tx args.
/// This is common for all tx types.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
/// * `password` - Password used for storage decryption.
///
/// # Errors
///
/// Returns JsError if token address is invalid.
fn tx_msg_into_args(tx_msg: TxMsg, password: Option<String>) -> Result<args::Tx, JsError> {
    let TxMsg {
        token,
        fee_amount,
        gas_limit,
        chain_id,
        public_key,
    } = tx_msg;

    let token = Address::from_str(&token)?;

    let fee_amount = Amount::from(fee_amount);
    let fee_input_amount = InputAmount::Unvalidated(DenominatedAmount {
        amount: fee_amount,
        denom: Denomination::from(0),
    });

    let password = password.map(|pwd| zeroize::Zeroizing::new(pwd));
    let gas_limit = Amount::from(gas_limit);
    let public_key = match public_key {
        Some(v) => {
            let pk = PublicKey::from_str(&v).map_err(JsError::from)?;
            Some(PK::Ed25519(pk))
        }
        _ => None,
    };

    let args = args::Tx {
        dry_run: false,
        dump_tx: false,
        force: false,
        broadcast_only: false,
        ledger_address: (),
        wallet_alias_force: false,
        initialized_account_alias: None,
        fee_amount: fee_input_amount,
        fee_token: token.clone(),
        gas_limit: GasLimit::from(gas_limit),
        expiration: None,
        chain_id: Some(ChainId(String::from(chain_id))),
        signing_key: None,
        signer: None,
        tx_reveal_code_path: PathBuf::from("tx_reveal_pk.wasm"),
        verification_key: public_key,
        password,
    };
    Ok(args)
}

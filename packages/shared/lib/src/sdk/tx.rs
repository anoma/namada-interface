use std::{path::PathBuf, str::FromStr};

use namada::core::borsh::{BorshDeserialize, BorshSerialize};
use namada::core::ibc::core::host::types::identifiers::{ChannelId, PortId};
use namada::tendermint_rpc;
use namada::tx::data::GasLimit;
use namada::{
    address::Address,
    chain::ChainId,
    ethereum_events::EthAddress,
    key::common::PublicKey,
    masp::{ExtendedSpendingKey, PaymentAddress, TransferSource, TransferTarget},
    sdk::args::{self, InputAmount},
    token::{Amount, DenominatedAmount, NATIVE_MAX_DECIMAL_PLACES},
};
use wasm_bindgen::JsError;

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct TxMsg {
    token: String,
    fee_amount: String,
    gas_limit: String,
    chain_id: String,
    public_key: Option<String>,
    disposable_signing_key: Option<bool>,
    fee_unshield: Option<String>,
    memo: Option<String>,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitBondMsg {
    source: String,
    validator: String,
    amount: String,
    native_token: String,
}

/// Maps serialized tx_msg into BondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn bond_tx_args(bond_msg: &[u8], tx_msg: &[u8]) -> Result<args::Bond, JsError> {
    let bond_msg = SubmitBondMsg::try_from_slice(bond_msg)?;

    let SubmitBondMsg {
        source,
        validator,
        native_token: _native_token,
        amount,
    } = bond_msg;

    let source = Address::from_str(&source)?;
    let validator = Address::from_str(&validator)?;
    let amount = Amount::from_str(&amount, NATIVE_MAX_DECIMAL_PLACES)?;
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::Bond {
        tx,
        validator,
        amount,
        source: Some(source),
        tx_code_path: PathBuf::from("tx_bond.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitUnbondMsg {
    source: String,
    validator: String,
    amount: String,
}

/// Maps serialized tx_msg into UnbondTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn unbond_tx_args(unbond_msg: &[u8], tx_msg: &[u8]) -> Result<args::Unbond, JsError> {
    let unbond_msg = SubmitUnbondMsg::try_from_slice(unbond_msg)?;

    let SubmitUnbondMsg {
        source,
        validator,
        amount,
    } = unbond_msg;

    let source = Address::from_str(&source)?;
    let validator = Address::from_str(&validator)?;

    let amount = Amount::from_str(&amount, NATIVE_MAX_DECIMAL_PLACES)?;
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::Unbond {
        tx,
        validator,
        amount,
        source: Some(source),
        tx_code_path: PathBuf::from("tx_unbond.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitWithdrawMsg {
    source: String,
    validator: String,
}

/// Maps serialized tx_msg into WithdrawTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn withdraw_tx_args(withdraw_msg: &[u8], tx_msg: &[u8]) -> Result<args::Withdraw, JsError> {
    let withdraw_msg = SubmitWithdrawMsg::try_from_slice(withdraw_msg)?;

    let SubmitWithdrawMsg { source, validator } = withdraw_msg;

    let source = Address::from_str(&source)?;
    let validator = Address::from_str(&validator)?;
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::Withdraw {
        tx,
        validator,
        source: Some(source),
        tx_code_path: PathBuf::from("tx_withdraw.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitVoteProposalMsg {
    signer: String,
    proposal_id: u64,
    vote: String,
}

/// Maps serialized tx_msg into VoteProposalTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn vote_proposal_tx_args(
    vote_proposal_msg: &[u8],
    tx_msg: &[u8],
) -> Result<args::VoteProposal, JsError> {
    let vote_proposal_msg = SubmitVoteProposalMsg::try_from_slice(vote_proposal_msg)?;

    let SubmitVoteProposalMsg {
        signer,
        proposal_id,
        vote,
    } = vote_proposal_msg;
    let tx = tx_msg_into_args(tx_msg)?;
    let voter = Address::from_str(&signer)?;

    let args = args::VoteProposal {
        tx,
        proposal_id: Some(proposal_id),
        is_offline: false,
        vote,
        voter,
        proposal_data: None,
        tx_code_path: PathBuf::from("tx_vote_proposal.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitTransferMsg {
    source: String,
    target: String,
    token: String,
    amount: String,
    native_token: String,
}

/// Maps serialized tx_msg into TransferTx args.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn transfer_tx_args(transfer_msg: &[u8], tx_msg: &[u8]) -> Result<args::TxTransfer, JsError> {
    let transfer_msg = SubmitTransferMsg::try_from_slice(transfer_msg)?;
    let SubmitTransferMsg {
        source,
        target,
        token,
        amount,
        native_token: _native_token,
    } = transfer_msg;

    let source = match Address::from_str(&source) {
        Ok(v) => Ok(TransferSource::Address(v)),
        Err(e1) => match ExtendedSpendingKey::from_str(&source) {
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

    let token = Address::from_str(&token)?;
    let denom_amount = DenominatedAmount::from_str(&amount).expect("Amount to be valid.");
    let amount = InputAmount::Unvalidated(denom_amount);
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::TxTransfer {
        tx,
        source,
        target,
        token,
        amount,
        tx_code_path: PathBuf::from("tx_transfer.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitIbcTransferMsg {
    source: String,
    receiver: String,
    token: String,
    amount: String,
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
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn ibc_transfer_tx_args(
    ibc_transfer_msg: &[u8],
    tx_msg: &[u8],
) -> Result<args::TxIbcTransfer, JsError> {
    let ibc_transfer_msg = SubmitIbcTransferMsg::try_from_slice(ibc_transfer_msg)?;
    let SubmitIbcTransferMsg {
        source,
        receiver,
        token,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
    } = ibc_transfer_msg;

    let source_address = Address::from_str(&source)?;
    let source = TransferSource::Address(source_address);
    let token = Address::from_str(&token)?;
    let denom_amount = DenominatedAmount::from_str(&amount).expect("Amount to be valid.");
    let amount = InputAmount::Unvalidated(denom_amount);
    let port_id = PortId::from_str(&port_id).expect("Port id to be valid");
    let channel_id = ChannelId::from_str(&channel_id).expect("Channel id to be valid");
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::TxIbcTransfer {
        tx,
        memo: None,
        source,
        receiver,
        token,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        tx_code_path: PathBuf::from("tx_ibc.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SubmitEthBridgeTransferMsg {
    nut: bool,
    asset: String,
    recipient: String,
    sender: String,
    amount: String,
    fee_amount: String,
    fee_payer: Option<String>,
    fee_token: String,
}

pub fn eth_bridge_transfer_tx_args(
    eth_bridge_transfer_msg: &[u8],
    tx_msg: &[u8],
) -> Result<args::EthereumBridgePool, JsError> {
    let eth_bridge_transfer_msg =
        SubmitEthBridgeTransferMsg::try_from_slice(eth_bridge_transfer_msg)?;
    let SubmitEthBridgeTransferMsg {
        nut,
        asset,
        recipient,
        sender,
        amount,
        fee_amount,
        fee_payer,
        fee_token,
    } = eth_bridge_transfer_msg;

    let tx = tx_msg_into_args(tx_msg)?;
    let asset = EthAddress::from_str(&asset).map_err(|e| JsError::new(&format!("{}", e)))?;
    let recipient =
        EthAddress::from_str(&recipient).map_err(|e| JsError::new(&format!("{}", e)))?;
    let sender = Address::from_str(&sender)?;
    let denom_amount = DenominatedAmount::from_str(&amount).expect("Amount to be valid.");
    let amount = InputAmount::Unvalidated(denom_amount);
    let denom_amount = DenominatedAmount::from_str(&fee_amount).expect("Amount to be valid.");
    let fee_amount = InputAmount::Unvalidated(denom_amount);
    let fee_payer = fee_payer.map(|v| Address::from_str(&v)).transpose()?;
    let fee_token = Address::from_str(&fee_token)?;
    let code_path = PathBuf::from("tx_bridge_pool.wasm");

    let args = args::EthereumBridgePool {
        nut,
        tx,
        asset,
        recipient,
        sender,
        amount,
        fee_amount,
        fee_payer,
        fee_token,
        code_path,
    };

    Ok(args)
}

pub fn tx_args_from_slice(tx_msg_bytes: &[u8]) -> Result<args::Tx, JsError> {
    let args = tx_msg_into_args(tx_msg_bytes)?;

    Ok(args)
}

/// Maps serialized tx_msg into Tx args.
/// This is common for all tx types.
///
/// # Arguments
///
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if token address is invalid.
fn tx_msg_into_args(tx_msg: &[u8]) -> Result<args::Tx, JsError> {
    let tx_msg = TxMsg::try_from_slice(tx_msg)?;
    let TxMsg {
        token,
        fee_amount,
        gas_limit,
        chain_id,
        public_key,
        disposable_signing_key,
        fee_unshield,
        memo,
    } = tx_msg;

    let token = Address::from_str(&token)?;

    let fee_amount = DenominatedAmount::from_str(&fee_amount)
        .expect(format!("Fee amount has to be valid. Received {}", fee_amount).as_str());
    let fee_input_amount = InputAmount::Unvalidated(fee_amount);

    let public_key = match public_key {
        Some(v) => {
            let pk = PublicKey::from_str(&v)?;
            Some(pk)
        }
        _ => None,
    };

    let disposable_signing_key = disposable_signing_key.unwrap_or(false);
    let signing_keys: Vec<PublicKey> = match public_key {
        Some(v) => vec![v.clone()],
        _ => vec![],
    };

    let fee_unshield = match fee_unshield {
        Some(v) => Some(TransferSource::ExtendedSpendingKey(
            ExtendedSpendingKey::from_str(&v)?,
        )),
        _ => None,
    };

    // Ledger address is not used in the SDK.
    // We can leave it as whatever as long as it's valid url.
    let ledger_address = tendermint_rpc::Url::from_str("http://notinuse:13337").unwrap();

    let memo = memo.map(|v| v.as_bytes().to_vec());

    let args = args::Tx {
        dry_run: false,
        dry_run_wrapper: false,
        disposable_signing_key,
        dump_tx: false,
        force: false,
        broadcast_only: false,
        ledger_address,
        wallet_alias_force: false,
        initialized_account_alias: None,
        fee_amount: Some(fee_input_amount),
        fee_token: token.clone(),
        fee_unshield,
        gas_limit: GasLimit::from_str(&gas_limit).expect("Gas limit to be valid"),
        wrapper_fee_payer: None,
        output_folder: None,
        expiration: None,
        chain_id: Some(ChainId(String::from(chain_id))),
        signatures: vec![],
        signing_keys,
        tx_reveal_code_path: PathBuf::from("tx_reveal_pk.wasm"),
        use_device: false,
        password: None,
        memo,
    };

    Ok(args)
}

use std::{path::PathBuf, str::FromStr};

use namada::core::borsh::{self, BorshDeserialize, BorshSerialize};
use namada::core::ibc::core::host::types::identifiers::{ChannelId, PortId};
use namada::sdk::signing::SigningTxData;
use namada::tendermint_rpc;
use namada::tx::data::GasLimit;
use namada::{
    address::Address,
    chain::ChainId,
    ethereum_events::EthAddress,
    key::common::PublicKey,
    masp::TransferSource,
    sdk::args::{self, InputAmount, TxExpiration},
    token::{Amount, DenominatedAmount, NATIVE_MAX_DECIMAL_PLACES},
};
use wasm_bindgen::JsError;

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct SigningData {
    owner: Option<String>,
    public_keys: Vec<u8>,
    threshold: u8,
    account_public_keys_map: Option<Vec<u8>>,
    fee_payer: String,
}

impl SigningData {
    // Create serializable struct from Namada type
    pub fn from_signing_tx_data(signing_tx_data: SigningTxData) -> Result<SigningData, JsError> {
        let owner: Option<String> = match signing_tx_data.owner {
            Some(addr) => Some(addr.to_string()),
            None => None,
        };
        let public_keys = borsh::to_vec(&signing_tx_data.public_keys)?;
        let fee_payer = signing_tx_data.fee_payer.to_string();
        let account_public_keys_map = match signing_tx_data.account_public_keys_map {
            Some(pk_map) => Some(borsh::to_vec(&pk_map)?),
            None => None,
        };

        Ok(SigningData {
            owner,
            public_keys,
            threshold: signing_tx_data.threshold,
            account_public_keys_map,
            fee_payer,
        })
    }

    // Create Namada type from this struct
    pub fn to_signing_tx_data(&self) -> Result<SigningTxData, JsError> {
        let owner: Option<Address> = match &self.owner {
            Some(addr) => Some(Address::from_str(&addr)?),
            None => None,
        };
        let public_keys = borsh::from_slice(&self.public_keys)?;
        let fee_payer = PublicKey::from_str(&self.fee_payer)?;
        let threshold = self.threshold;
        let account_public_keys_map = match &self.account_public_keys_map {
            Some(pk_map) => Some(borsh::from_slice(&pk_map)?),
            None => None,
        };

        Ok(SigningTxData {
            owner,
            public_keys,
            fee_payer,
            threshold,
            account_public_keys_map,
        })
    }

    pub fn to_bytes(&self) -> Result<Vec<u8>, JsError> {
        Ok(borsh::to_vec(&self)?)
    }
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct WrapperTxMsg {
    token: String,
    fee_amount: String,
    gas_limit: String,
    chain_id: String,
    public_key: Option<String>,
    disposable_signing_key: Option<bool>,
    memo: Option<String>,
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct BondMsg {
    source: String,
    validator: String,
    amount: String,
    native_token: String,
}

/// Maps serialized tx_msg into BondTx args.
///
/// # Arguments
///
/// * `bond_msg` - Borsh serialized bond_msg.
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn bond_tx_args(bond_msg: &[u8], tx_msg: &[u8]) -> Result<args::Bond, JsError> {
    let bond_msg = BondMsg::try_from_slice(bond_msg)?;

    let BondMsg {
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
pub struct UnbondMsg {
    source: String,
    validator: String,
    amount: String,
}

/// Maps serialized tx_msg into UnbondTx args.
///
/// # Arguments
///
/// * `unbond_msg` - Borsh serialized unbond_msg.
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn unbond_tx_args(unbond_msg: &[u8], tx_msg: &[u8]) -> Result<args::Unbond, JsError> {
    let unbond_msg = UnbondMsg::try_from_slice(unbond_msg)?;

    let UnbondMsg {
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
pub struct WithdrawMsg {
    source: String,
    validator: String,
}

/// Maps serialized tx_msg into WithdrawTx args.
///
/// # Arguments
///
/// * `withdraw_msg` - Borsh serialized withdraw_msg.
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn withdraw_tx_args(withdraw_msg: &[u8], tx_msg: &[u8]) -> Result<args::Withdraw, JsError> {
    let withdraw_msg = WithdrawMsg::try_from_slice(withdraw_msg)?;

    let WithdrawMsg { source, validator } = withdraw_msg;

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
pub struct RedelegateMsg {
    owner: String,
    source_validator: String,
    destination_validator: String,
    amount: String,
}

/// Maps serialized tx_msg into RedelgationTx args.
///
/// # Arguments
///
/// * `redelegate_msg` - Borsh serialized redelegation_msg.
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn redelegate_tx_args(
    redelegate_msg: &[u8],
    tx_msg: &[u8],
) -> Result<args::Redelegate, JsError> {
    let redelegate_msg = RedelegateMsg::try_from_slice(redelegate_msg)?;

    let RedelegateMsg {
        owner,
        source_validator,
        destination_validator,
        amount,
    } = redelegate_msg;

    let owner = Address::from_str(&owner)?;
    let src_validator = Address::from_str(&source_validator)?;
    let dest_validator = Address::from_str(&destination_validator)?;
    let amount = Amount::from_str(&amount, NATIVE_MAX_DECIMAL_PLACES)?;
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::Redelegate {
        tx,
        src_validator,
        dest_validator,
        amount,
        owner,
        tx_code_path: PathBuf::from("tx_redelegate.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct VoteProposalMsg {
    signer: String,
    proposal_id: u64,
    vote: String,
}

/// Maps serialized tx_msg into VoteProposalTx args.
///
/// # Arguments
///
/// * `vote_proposal_msg` - Borsh serialized vote_proposal_msg.
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
    let vote_proposal_msg = VoteProposalMsg::try_from_slice(vote_proposal_msg)?;

    let VoteProposalMsg {
        signer,
        proposal_id,
        vote,
    } = vote_proposal_msg;
    let tx = tx_msg_into_args(tx_msg)?;
    let voter_address = Address::from_str(&signer)?;

    let args = args::VoteProposal {
        tx,
        proposal_id,
        vote,
        voter_address,
        tx_code_path: PathBuf::from("tx_vote_proposal.wasm"),
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct TransparentTransferMsg {
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
/// * `transfer_msg` - Borsh serialized transfer_msg.
/// * `tx_msg` - Borsh serialized tx_msg.
///
/// # Errors
///
/// Returns JsError if the tx_msg can't be deserialized or
/// Rust structs can't be created.
pub fn transparent_transfer_tx_args(
    transfer_msg: &[u8],
    tx_msg: &[u8],
) -> Result<args::TxTransparentTransfer, JsError> {
    let transfer_msg = TransparentTransferMsg::try_from_slice(transfer_msg)?;
    let TransparentTransferMsg {
        source,
        target,
        token,
        amount,
        native_token: _native_token,
    } = transfer_msg;

    let source = Address::from_str(&source)?;

    let target = Address::from_str(&target)?;

    let token = Address::from_str(&token)?;
    let denom_amount = DenominatedAmount::from_str(&amount).expect("Amount to be valid.");
    let amount = InputAmount::Unvalidated(denom_amount);
    let tx = tx_msg_into_args(tx_msg)?;

    let args = args::TxTransparentTransfer {
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
pub struct IbcTransferMsg {
    source: String,
    receiver: String,
    token: String,
    amount: String,
    port_id: String,
    channel_id: String,
    timeout_height: Option<u64>,
    timeout_sec_offset: Option<u64>,
    memo: Option<String>,
}

/// Maps serialized tx_msg into IbcTransferTx args.
///
/// # Arguments
///
/// * `ibc_transfer_msg` - Borsh serialized ibc_transfer_msg.
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
    let ibc_transfer_msg = IbcTransferMsg::try_from_slice(ibc_transfer_msg)?;
    let IbcTransferMsg {
        source,
        receiver,
        token,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        memo,
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
        memo,
        source,
        receiver,
        token,
        amount,
        port_id,
        channel_id,
        timeout_height,
        timeout_sec_offset,
        tx_code_path: PathBuf::from("tx_ibc.wasm"),
        refund_target: None,
    };

    Ok(args)
}

#[derive(BorshSerialize, BorshDeserialize)]
#[borsh(crate = "namada::core::borsh")]
pub struct EthBridgeTransferMsg {
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
    let eth_bridge_transfer_msg = EthBridgeTransferMsg::try_from_slice(eth_bridge_transfer_msg)?;
    let EthBridgeTransferMsg {
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
    let tx_msg = WrapperTxMsg::try_from_slice(tx_msg)?;
    let WrapperTxMsg {
        token,
        fee_amount,
        gas_limit,
        chain_id,
        public_key,
        disposable_signing_key,
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
        gas_limit: GasLimit::from_str(&gas_limit).expect("Gas limit to be valid"),
        wrapper_fee_payer: None,
        output_folder: None,
        expiration: TxExpiration::Default,
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

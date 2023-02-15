use std::str::FromStr;

use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ledger::{
        args,
        masp::ShieldedContext,
        tx,
        wallet::{SdkWalletUtils, Wallet},
    },
    types::{
        address::Address,
        masp::{TransferSource, TransferTarget},
        token::Amount,
        transaction::GasLimit,
    },
};
use wasm_bindgen::JsError;

use crate::rpc_client::HttpClient;

use super::masp::WebShieldedUtils;

type WalletUtils = SdkWalletUtils<String>;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct TxMsg {
    token: String,
    fee_amount: u64,
    gas_limit: u64,
    tx_code: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct SubmitBondMsg {
    source: String,
    validator: String,
    amount: u64,
    tx_code: Vec<u8>,
    native_token: String,
    tx: TxMsg,
}

pub async fn submit_bond(
    client: &HttpClient,
    wallet: &mut Wallet<WalletUtils>,
    tx_msg: &[u8],
    password: Option<String>,
) -> Result<(), JsError> {
    let tx_msg = SubmitBondMsg::try_from_slice(tx_msg)
        .map_err(|err| JsError::new(&format!("BorshDeserialize failed! {:?}", err)))?;
    let SubmitBondMsg {
        native_token,
        source,
        validator,
        amount,
        tx_code: bond_tx_code,
        tx,
    } = tx_msg;

    let source = Address::from_str(&source).expect("Address from string should not fail");
    let native_token =
        Address::from_str(&native_token).expect("Address from string should not fail");
    let validator = Address::from_str(&validator).expect("Address from string should not fail");
    let amount = Amount::from(amount);

    let args = args::Bond {
        tx: tx_msg_into_args(tx, password),
        validator,
        amount,
        source: Some(source),
        native_token,
        tx_code_path: bond_tx_code,
    };

    tx::submit_bond(client, wallet, args)
        .await
        .map_err(|e| JsError::from(e))
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
    tx_code: Vec<u8>,
}

pub async fn submit_transfer(
    client: &HttpClient,
    wallet: &mut Wallet<WalletUtils>,
    shielded_ctx: &mut ShieldedContext<WebShieldedUtils>,
    tx_msg: &[u8],
    password: Option<String>,
) -> Result<(), JsError> {
    let tx_msg = SubmitTransferMsg::try_from_slice(tx_msg)
        .map_err(|err| JsError::new(&format!("BorshDeserialize failed! {:?}", err)))?;
    let SubmitTransferMsg {
        tx,
        source,
        target,
        token,
        sub_prefix,
        amount,
        native_token,
        tx_code: transfer_tx_code,
    } = tx_msg;

    let source = Address::from_str(&source).expect("Address from string should not fail");
    let target = Address::from_str(&target).expect("Address from string should not fail");
    let native_token =
        Address::from_str(&native_token).expect("Address from string should not fail");
    let token = Address::from_str(&token).expect("Address from string should not fail");
    let amount = Amount::from(amount);

    let args = args::TxTransfer {
        tx: tx_msg_into_args(tx, password),
        source: TransferSource::Address(source),
        target: TransferTarget::Address(target),
        token,
        sub_prefix,
        amount,
        native_token,
        tx_code_path: transfer_tx_code,
    };

    tx::submit_transfer(client, wallet, shielded_ctx, args)
        .await
        .map_err(|e| JsError::from(e))
}

fn tx_msg_into_args(tx_msg: TxMsg, password: Option<String>) -> args::Tx {
    let TxMsg {
        token,
        fee_amount,
        gas_limit,
        tx_code,
    } = tx_msg;

    let token = Address::from_str(&token).expect("Address from string should not fail");
    let fee_amount = Amount::from(fee_amount);

    args::Tx {
        dry_run: false,
        force: false,
        broadcast_only: false,
        ledger_address: (),
        initialized_account_alias: None,
        fee_amount,
        fee_token: token.clone(),
        gas_limit: GasLimit::from(gas_limit),
        signing_key: None,
        signer: None,
        tx_code_path: tx_code,
        password,
    }
}

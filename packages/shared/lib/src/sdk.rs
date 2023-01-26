use std::str::FromStr;

use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ledger::{
        args,
        tx::submit_bond,
        wallet::{Alias, ConfirmationResponse, Store, StoredKeypair, Wallet, WalletUtils},
    },
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
        token,
        transaction::GasLimit,
    },
};
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;

const STORAGE_PATH: &str = "";

pub struct WebWallet {}

impl WalletUtils for WebWallet {
    type Storage = std::string::String;

    fn read_and_confirm_pwd(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }

    fn read_password(_prompt_msg: &str) -> String {
        todo!()
    }

    fn read_alias(_prompt_msg: &str) -> String {
        todo!()
    }

    fn show_overwrite_confirmation(_alias: &Alias, _alias_for: &str) -> ConfirmationResponse {
        ConfirmationResponse::Replace
    }

    fn new_password_prompt(_unsafe_dont_encrypt: bool) -> Option<String> {
        todo!()
    }
}

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

#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<WebWallet>,
}

#[wasm_bindgen]
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        console_error_panic_hook::set_once();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(STORAGE_PATH.to_owned(), Store::default()),
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        self.wallet.store().encode()
    }

    pub fn decode(mut self, data: Vec<u8>) {
        let store = Store::decode(data).expect("TODO");
        self.wallet = Wallet::new(STORAGE_PATH.to_owned(), store);
    }

    pub fn add_keys(&mut self, private_key: &str, alias: Option<String>) {
        let sk = key::ed25519::SecretKey::from_str(private_key)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
            .expect("FIX ME");
        let sk = SecretKey::Ed25519(sk);

        let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
        // What with pw?
        let (keypair_to_store, _raw_keypair) = StoredKeypair::new(sk, None);
        let address = Address::Implicit(ImplicitAddress(pkh.clone()));
        let alias: Alias = alias.unwrap_or_else(|| pkh.clone().into()).into();
        if self
            .wallet
            .store_mut()
            .insert_keypair::<WebWallet>(alias.clone(), keypair_to_store, pkh)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
        if self
            .wallet
            .store_mut()
            .insert_address::<WebWallet>(alias.clone(), address)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
    }

    pub async fn submit_bond(&mut self, tx_msg: &[u8]) -> Result<(), JsError> {
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
        let amount = token::Amount::from(amount);

        let args = args::Bond {
            tx: Self::tx_msg_into_args(tx),
            validator,
            amount,
            source: Some(source),
            native_token,
            tx_code_path: bond_tx_code,
        };

        submit_bond(&self.client, &mut self.wallet, args)
            .await
            .map_err(|e| JsError::from(e))
    }

    //TODO: move somewhere else
    fn tx_msg_into_args(tx_msg: TxMsg) -> args::Tx {
        let TxMsg {
            token,
            fee_amount,
            gas_limit,
            tx_code,
        } = tx_msg;

        let token = Address::from_str(&token).expect("Address from string should not fail");
        let fee_amount = token::Amount::from(fee_amount);

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
        }
    }
}

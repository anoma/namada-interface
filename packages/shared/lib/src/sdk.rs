use std::str::FromStr;

use borsh::{BorshDeserialize, BorshSerialize};
use masp_primitives::zip32::ExtendedFullViewingKey;
use masp_proofs::prover::LocalTxProver;
use namada::{
    ledger::{
        args,
        masp::{ShieldedContext, ShieldedUtils},
        tx::{submit_bond, submit_transfer},
        wallet::{Alias, SdkWalletUtils, Store, StoredKeypair, Wallet},
    },
    types::{
        address::{Address, ImplicitAddress},
        key::{self, common::SecretKey, PublicKeyHash, RefTo},
        masp::{ExtendedSpendingKey, TransferSource, TransferTarget},
        token,
        transaction::GasLimit,
    },
};
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;

const STORAGE_PATH: &str = "";

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
pub struct WebShieldedUtils {}

impl ShieldedUtils for WebShieldedUtils {
    type C = HttpClient;

    fn local_tx_prover(&self) -> LocalTxProver {
        todo!()
    }

    fn load(self) -> std::io::Result<ShieldedContext<Self>> {
        todo!()
    }

    fn save(&self, _ctx: &ShieldedContext<Self>) -> std::io::Result<()> {
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

type WalletUtils = SdkWalletUtils<String>;

#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<WalletUtils>,
    shielded_ctx: ShieldedContext<WebShieldedUtils>,
}

#[wasm_bindgen]
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        console_error_panic_hook::set_once();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(STORAGE_PATH.to_owned(), Store::default()),
            shielded_ctx: ShieldedContext::default(),
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        self.wallet.store().encode()
    }

    pub fn decode(&mut self, data: Vec<u8>) {
        let store = Store::decode(data).expect("To be able to decode stored data.");
        self.wallet = Wallet::new(STORAGE_PATH.to_owned(), store);
    }

    pub fn add_keys(&mut self, private_key: &str, password: Option<String>, alias: Option<String>) {
        let sk = key::ed25519::SecretKey::from_str(private_key)
            .map_err(|err| format!("ed25519 encoding failed: {:?}", err))
            .expect("FIX ME");
        let sk = SecretKey::Ed25519(sk);

        let pkh: PublicKeyHash = PublicKeyHash::from(&sk.ref_to());
        // TODO: Password is None
        let (keypair_to_store, _raw_keypair) = StoredKeypair::new(sk, password);
        let address = Address::Implicit(ImplicitAddress(pkh.clone()));
        let alias: Alias = alias.unwrap_or_else(|| pkh.clone().into()).into();
        if self
            .wallet
            .store_mut()
            .insert_keypair::<WalletUtils>(alias.clone(), keypair_to_store, pkh)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
        if self
            .wallet
            .store_mut()
            .insert_address::<WalletUtils>(alias.clone(), address)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
    }

    pub fn add_spending_key(&mut self, xsk: &[u8], password: Option<String>, alias: &str) {
        let xsk: masp_primitives::zip32::ExtendedSpendingKey =
            BorshDeserialize::try_from_slice(xsk).expect("To deserialize xsk");

        let xsk = ExtendedSpendingKey::from(xsk);
        let viewkey = ExtendedFullViewingKey::from(&xsk.into()).into();

        // TODO: Password is None
        let (spendkey_to_store, _raw_spendkey) = StoredKeypair::new(xsk, password);
        let alias = Alias::from(alias);
        if self
            .wallet
            .store_mut()
            .insert_spending_key::<WalletUtils>(alias.clone(), spendkey_to_store, viewkey)
            .is_none()
        {
            panic!("Action cancelled, no changes persisted.");
        }
    }

    pub async fn submit_bond(
        &mut self,
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
        let amount = token::Amount::from(amount);

        let args = args::Bond {
            tx: Self::tx_msg_into_args(tx, password),
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

    pub async fn submit_transfer(
        &mut self,
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
        let amount = token::Amount::from(amount);

        let args = args::TxTransfer {
            tx: Self::tx_msg_into_args(tx, password),
            source: TransferSource::Address(source),
            target: TransferTarget::Address(target),
            token,
            sub_prefix,
            amount,
            native_token,
            tx_code_path: transfer_tx_code,
        };

        submit_transfer(&self.client, &mut self.wallet, &mut self.shielded_ctx, args)
            .await
            .map_err(|e| JsError::from(e))
    }

    //TODO: move somewhere else
    fn tx_msg_into_args(tx_msg: TxMsg, password: Option<String>) -> args::Tx {
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
            password,
        }
    }
}

use namada::ledger::{
    masp::ShieldedContext,
    wallet::{Store, Wallet},
};
use wasm_bindgen::{prelude::wasm_bindgen, JsError};

use crate::rpc_client::HttpClient;

mod masp;
mod tx;
mod wallet;

#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<wallet::WalletUtils>,
    shielded_ctx: ShieldedContext<masp::WebShieldedUtils>,
}

#[wasm_bindgen]
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        console_error_panic_hook::set_once();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(wallet::STORAGE_PATH.to_owned(), Store::default()),
            shielded_ctx: ShieldedContext::default(),
        }
    }

    pub fn encode(&self) -> Vec<u8> {
        wallet::encode(&self.wallet)
    }

    pub fn decode(&mut self, data: Vec<u8>) {
        wallet::decode(&mut self.wallet, data)
    }

    pub fn add_keys(&mut self, private_key: &str, password: Option<String>, alias: Option<String>) {
        wallet::add_keys(&mut self.wallet, private_key, password, alias)
    }

    pub fn add_spending_key(&mut self, xsk: &[u8], password: Option<String>, alias: &str) {
        wallet::add_spending_key(&mut self.wallet, xsk, password, alias)
    }

    pub async fn submit_bond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        tx::submit_bond(&self.client, &mut self.wallet, tx_msg, password).await
    }

    pub async fn submit_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        tx::submit_transfer(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            tx_msg,
            password,
        )
        .await
    }
}

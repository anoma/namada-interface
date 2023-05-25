use js_sys::Uint8Array;
use namada::ledger::{
    masp::ShieldedContext,
    wallet::{Store, Wallet},
};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

use crate::{rpc_client::HttpClient, sdk::masp::WebShieldedUtils};

mod masp;
mod tx;
mod wallet;

/// Represents the Sdk public API.
#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<wallet::BrowserWalletUtils>,
    shielded_ctx: ShieldedContext<masp::WebShieldedUtils>,
}

#[wasm_bindgen]
/// Sdk mostly wraps the logic of the Sdk struct members, making it a part of public API.
/// For more details, navigate to the corresponding modules.
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        console_error_panic_hook::set_once();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(wallet::STORAGE_PATH.to_owned(), Store::default()),
            // TODO: Probably makes sense to override default to handle cases when params are not
            // yet loaded
            shielded_ctx: ShieldedContext::default(),
        }
    }

    //TODO: move to utils
    fn to_bytes(u_int_8_array: JsValue) -> Vec<u8> {
        let array = Uint8Array::new(&u_int_8_array);
        array.to_vec()
    }

    pub async fn fetch_masp_params(&mut self) -> Result<(), JsValue> {
        let spend = fetch_and_store("masp-spend.params").await?;
        let output = fetch_and_store("masp-output.params").await?;
        let convert = fetch_and_store("masp-convert.params").await?;

        self.shielded_ctx = WebShieldedUtils::new(
            Self::to_bytes(spend),
            Self::to_bytes(output),
            Self::to_bytes(convert),
        );

        Ok(())
    }

    pub fn encode(&self) -> Vec<u8> {
        wallet::encode(&self.wallet)
    }

    pub fn decode(&mut self, data: Vec<u8>) -> Result<(), JsError> {
        let wallet = wallet::decode(data)?;
        self.wallet = wallet;
        Ok(())
    }

    pub fn add_key(&mut self, private_key: &str, password: Option<String>, alias: Option<String>) {
        wallet::add_key(&mut self.wallet, private_key, password, alias)
    }

    pub fn add_spending_key(&mut self, xsk: &[u8], password: Option<String>, alias: &str) {
        wallet::add_spending_key(&mut self.wallet, xsk, password, alias)
    }

    pub async fn submit_bond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::bond_tx_args(tx_msg, password)?;

        namada::ledger::tx::submit_bond(&mut self.client, &mut self.wallet, args)
            .await
            .map_err(|e| JsError::from(e))
    }

    pub async fn submit_unbond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::unbond_tx_args(tx_msg, password)?;

        namada::ledger::tx::submit_unbond(&mut self.client, &mut self.wallet, args)
            .await
            .map_err(|e| JsError::from(e))
    }

    pub async fn submit_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::transfer_tx_args(tx_msg, password)?;

        namada::ledger::tx::submit_transfer(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args,
        )
        .await
        .map_err(|e| JsError::from(e))
    }

    pub async fn submit_ibc_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::ibc_transfer_tx_args(tx_msg, password)?;

        namada::ledger::tx::submit_ibc_transfer(&self.client, &mut self.wallet, args)
            .await
            .map_err(|e| JsError::from(e))
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "fetchAndStore")]
    async fn fetch_and_store(params: &str) -> Result<JsValue, JsValue>;
}

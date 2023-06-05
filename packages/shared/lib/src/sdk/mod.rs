use std::str::FromStr;

use gloo_utils::format::JsValueSerdeExt;
use masp_primitives::{transaction::components::Amount, zip32::ExtendedFullViewingKey};
use namada::{
    ledger::{
        masp::ShieldedContext,
        rpc::{get_token_balance, query_storage_prefix},
        wallet::{AddressVpType, Store, Wallet},
    },
    proof_of_stake::KeySeg,
    types::{address::Address, masp::ExtendedViewingKey, token},
};
use serde::Serialize;
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

use crate::{rpc_client::HttpClient, sdk::masp::WebShieldedUtils, utils::to_bytes};

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
            shielded_ctx: ShieldedContext::default(),
        }
    }

    pub async fn fetch_masp_params(&mut self) -> Result<(), JsValue> {
        let spend = fetch_and_store("masp-spend.params").await?;
        let output = fetch_and_store("masp-output.params").await?;
        let convert = fetch_and_store("masp-convert.params").await?;

        self.shielded_ctx =
            WebShieldedUtils::new(to_bytes(spend), to_bytes(output), to_bytes(convert));

        Ok(())
    }

    pub async fn async_test(&mut self) {
        web_sys::console::log_1(&"async_test".into());
    }

    pub fn encode(&self) -> Vec<u8> {
        wallet::encode(&self.wallet)
    }

    pub fn decode(&mut self, data: Vec<u8>) -> Result<(), JsError> {
        let mut wallet = wallet::decode(data)?;
        //TODO: Figure out if we can do something better than adding token addresses manually
        // NAM
        wallet.add_vp_type_to_address(AddressVpType::Token, Address::from_str("atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5").unwrap());
        // ATOM
        wallet.add_vp_type_to_address(AddressVpType::Token, Address::from_str("atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9").unwrap());
        // ETH
        wallet.add_vp_type_to_address(AddressVpType::Token, Address::from_str("atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p").unwrap());
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
        xsk: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::transfer_tx_args(tx_msg, password, xsk)?;
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

    fn to_js_result<T>(result: T) -> Result<JsValue, JsError>
    where
        T: Serialize,
    {
        match JsValue::from_serde(&result) {
            Ok(v) => Ok(v),
            Err(e) => Err(JsError::new(&e.to_string())),
        }
    }

    fn get_decoded_balance(decoded_balance: Amount<Address>) -> Vec<(Address, token::Amount)> {
        let mut result = Vec::new();

        for (addr, value) in decoded_balance.components() {
            let asset_value = token::Amount::from(*value as u64);
            result.push((addr.clone(), asset_value));
        }

        result
    }

    async fn query_transparent_balance(&self, owner: Address) -> Vec<(Address, token::Amount)> {
        let tokens = self.wallet.get_addresses_with_vp_type(AddressVpType::Token);
        let mut result = vec![];
        for token in tokens {
            let balances = get_token_balance(&self.client, &token, &owner)
                .await
                .unwrap_or(token::Amount::whole(0));
            result.push((token, balances));
        }
        result
    }

    async fn query_shielded_balance(
        &self,
        xvk: ExtendedViewingKey,
    ) -> Vec<(Address, token::Amount)> {
        let viewing_key = ExtendedFullViewingKey::from(xvk).fvk.vk;
        let mut shielded: ShieldedContext<masp::WebShieldedUtils> = ShieldedContext::default();

        let _ = shielded.load();
        let fvks: Vec<_> = vec![xvk]
            .iter()
            .map(|fvk| ExtendedFullViewingKey::from(*fvk).fvk.vk)
            .collect();

        shielded.fetch(&self.client, &[], &fvks).await;

        let epoch = namada::ledger::rpc::query_epoch(&self.client).await;
        let balance = shielded
            .compute_exchanged_balance(&self.client, &viewing_key, epoch)
            .await
            .expect("context should contain viewing key");
        let decoded_balance = shielded.decode_amount(&self.client, balance, epoch).await;

        Self::get_decoded_balance(decoded_balance)
    }

    pub async fn query_balance(&self, owner: String) -> Result<JsValue, JsError> {
        let result = match Address::from_str(&owner) {
            Ok(addr) => self.query_transparent_balance(addr).await,
            Err(e1) => match ExtendedViewingKey::from_str(&owner) {
                Ok(xvk) => self.query_shielded_balance(xvk).await,
                Err(e2) => return Err(JsError::new(&format!("{} {}", e1, e2))),
            },
        };

        Self::to_js_result(result)
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "fetchAndStore")]
    async fn fetch_and_store(params: &str) -> Result<JsValue, JsValue>;
}

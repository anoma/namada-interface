use js_sys::JSON::stringify;
use namada::storage::BlockHeight;
use std::fmt::Debug;
use std::fmt::Display;
use thiserror::Error;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

use namada::ledger::queries::{Client, EncodedResponseQuery};
use namada::tendermint::{self, abci::Code};
use namada::tendermint_rpc::{
    error::Error as TendermintRpcError, Response as RpcResponse, SimpleRequest,
};

#[wasm_bindgen(module = "/src/rpc_client.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "wasmFetch")]
    async fn wasmFetch(url: JsValue, method: JsValue, body: JsValue) -> Result<JsValue, JsValue>;
}

#[derive(Clone, Error, Debug)]
pub struct RpcError(String);

impl RpcError {
    pub fn new(msg: &str) -> Self {
        RpcError(String::from(msg))
    }
}

impl Display for RpcError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        Display::fmt(&self.0, f)
    }
}

impl From<std::io::Error> for RpcError {
    fn from(error: std::io::Error) -> Self {
        RpcError::new(&error.to_string())
    }
}

impl From<namada::tendermint::Error> for RpcError {
    fn from(error: namada::tendermint::Error) -> Self {
        RpcError::new(&error.to_string())
    }
}

impl From<namada::tendermint_rpc::Error> for RpcError {
    fn from(error: namada::tendermint_rpc::Error) -> Self {
        RpcError::new(&error.to_string())
    }
}

pub struct HttpClient {
    url: String,
}

/// HttpClient implementation using `window.fetch` API.
impl HttpClient {
    pub fn new(url: String) -> HttpClient {
        HttpClient { url }
    }

    async fn fetch(&self, url: &str, method: &str, body: &str) -> Result<JsValue, JsValue> {
        let resp_value = wasmFetch(
            JsValue::from_str(url),
            JsValue::from_str(method),
            JsValue::from_str(body),
        )
        .await?;

        let resp: Response = resp_value.dyn_into()?;
        JsFuture::from(resp.json().unwrap()).await
    }
}

#[async_trait::async_trait(?Send)]
impl Client for HttpClient {
    /// Implementation of the `Client` trait for the `HttpClient` struct.
    /// It's used by the Sdk to perform queries to the blockchain.
    type Error = RpcError;

    /// Wrapper for tendermint specific abci_query.
    ///
    /// # Arguments
    ///
    /// * `path` - path of the resource in the storage.
    /// * `data` - query params in the form of bytearray.
    /// * `height` - height of the specific blockchain block that we are querying information from.
    ///              0 means the latest block.
    /// * `prove` - include proofs of the transactions inclusion in the block
    async fn request(
        &self,
        path: String,
        data: Option<Vec<u8>>,
        height: Option<BlockHeight>,
        prove: bool,
    ) -> Result<EncodedResponseQuery, Self::Error> {
        let data = data.unwrap_or_default();
        let height = height
            .map(|height| tendermint::block::Height::try_from(height.0))
            .transpose()?;

        let response = self
            .abci_query(
                Some(std::str::FromStr::from_str(&path).unwrap()),
                data,
                height,
                prove,
            )
            .await?;
        let response = response.clone();
        let code = Code::from(response.code);

        match code {
            Code::Ok => Ok(EncodedResponseQuery {
                data: response.value,
                info: response.info,
                proof: response.proof,
            }),
            Code::Err(code) => Err(RpcError::new(&format!("Error code {}", code))),
        }
    }

    /// Performs request using fetch API. Maps returned JS object to the `RpcResponse` struct.
    ///
    /// # Arguments
    ///
    /// * `request` - request type to be performed. Check `Client` trait for available requests.
    async fn perform<R>(&self, request: R) -> Result<R::Output, TendermintRpcError>
    where
        R: SimpleRequest,
    {
        let request_body = request.into_json();

        let response = self
            .fetch(&self.url[..], "POST", &request_body)
            .await
            .map_err(|e| {
                let e = stringify(&e).expect("Error to be serializable");
                let e_str: String = e.into();
                // There is no "generic" RpcError, so we have to pick
                // one with error msg as an argument.
                TendermintRpcError::server(e_str)
            })?;
        let response_json: String = stringify(&response)
            .expect("JS object to be serializable")
            .into();

        Ok(R::Response::from_string(&response_json).unwrap().into())
    }
}

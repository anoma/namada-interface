use gloo_utils::format::JsValueSerdeExt;
use namada::ledger::queries::{Client, EncodedResponseQuery};
use namada::tendermint::abci::{Code, Log, Path};
use namada::tendermint::block::Height;
use namada::tendermint::merkle::proof::Proof;
use namada::tendermint::serializers;
use namada::tendermint::{self, block};
use namada::tendermint_rpc::error::Error as RpcError;
use namada::types::storage::BlockHeight;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use std::str::FromStr;
use tendermint_rpc::query::Query;
use tendermint_rpc::{Order, SimpleRequest};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize)]
pub struct AbciResponse {
    /// ABCI query results
    pub response: AbciQuery,
}

/// ABCI query results
#[derive(Clone, Debug, PartialEq, Eq, Deserialize, Serialize, Default)]
#[serde(default)]
pub struct AbciQuery {
    /// Response code
    pub code: u32,

    /// Log value
    pub log: Log,

    /// Info value
    #[serde(default = "String::new")]
    pub info: String,

    /// Index
    #[serde(with = "serializers::from_str")]
    pub index: i64,

    /// Key
    #[serde(default, with = "serializers::bytes::base64string")]
    pub key: Vec<u8>,

    /// Value
    #[serde(default, with = "serializers::bytes::base64string")]
    pub value: Vec<u8>,

    /// Proof (might be explicit null)
    #[serde(alias = "proofOps")]
    pub proof: Option<Proof>,

    /// Block height
    #[serde(with = "serializers::from_str")]
    pub height: block::Height,

    /// Codespace
    #[serde(default = "String::new")]
    pub codespace: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AbciQueryResult {
    #[serde(default = "String::new")]
    pub id: String,

    #[serde(default = "String::new")]
    pub jsonrpc: String,

    pub result: AbciResponse,
}

#[derive(Deserialize, Serialize)]
struct AbciParams {
    path: Path,
    data: Option<Vec<u8>>,
    height: Option<BlockHeight>,
    prove: bool,
}

#[derive(Deserialize, Serialize)]
pub struct AbciRequest {
    id: String,
    jsonrpc: String,
    method: String,
    params: AbciParams,
}

#[derive()]
pub struct HttpClient {
    url: String,
}

impl HttpClient {
    pub fn new(url: String) -> HttpClient {
        HttpClient { url }
    }

    async fn fetch(&self, url: &str, method: &str, body: &str) -> Result<JsValue, JsValue> {
        let mut opts = RequestInit::new();
        opts.method(method);
        opts.mode(RequestMode::Cors);
        opts.body(Some(&JsValue::from(body)));

        let request = Request::new_with_str_and_init(url, &opts)?;
        let window = web_sys::window().expect("Window object does not exist");
        let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;

        let resp: Response = resp_value.dyn_into()?;
        JsFuture::from(resp.json().unwrap()).await
    }
}

#[async_trait::async_trait(?Send)]
impl Client for HttpClient {
    type Error = JsError;

    async fn request(
        &self,
        path: String,
        data: Option<Vec<u8>>,
        height: Option<BlockHeight>,
        prove: bool,
    ) -> Result<EncodedResponseQuery, Self::Error> {
        let data = data.unwrap_or_default();
        let height = height
            .map(|height| {
                tendermint::block::Height::try_from(height.0).map_err(|_err| JsError::new("TODO"))
            })
            .transpose()?;

        let response = self
            .abci_query(
                // TODO open the private Path constructor in tendermint-rpc
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
            Code::Err(code) => Err(JsError::new(&format!("Error code {}", code))),
        }
    }

    async fn perform<R>(&self, request: R) -> Result<R::Response, RpcError>
    where
        R: SimpleRequest,
    {
        let req_json = serde_json::to_string_pretty(&request).expect("TODO");
        let response_json = self
            .fetch(&self.url[..], "POST", &req_json)
            .await
            .expect("TODO");
        let response: R::Response = JsValue::into_serde(&response_json).expect("TODO");
        Ok(response)
    }
}

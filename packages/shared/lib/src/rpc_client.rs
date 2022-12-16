use gloo_utils::format::JsValueSerdeExt;
use namada::ledger::queries::{Client, EncodedResponseQuery};
use namada::tendermint::abci::{Code, Log, Path};
use namada::tendermint::block;
use namada::tendermint::merkle::proof::Proof;
use namada::tendermint::serializers;
use namada::types::storage::BlockHeight;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use std::str::FromStr;
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

pub struct HttpClient {
    url: String,
}

impl HttpClient {
    pub fn new(url: String) -> HttpClient {
        HttpClient { url }
    }

    fn create_json_rpc_request(&self, abci_params: AbciParams) -> AbciRequest {
        AbciRequest {
            id: "".to_owned(),
            jsonrpc: "2.0".to_owned(),
            method: "abci_query".to_owned(),
            params: abci_params,
        }
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

    pub async fn abci_query(
        &self,
        url: &str,
        path: &str,
        data: Option<Vec<u8>>,
        height: Option<BlockHeight>,
        prove: bool,
    ) -> Result<AbciQuery, JsError> {
        let path = Path::from_str(path)?;
        let json_rpc_request = &self.create_json_rpc_request(AbciParams {
            path,
            data,
            height,
            prove,
        });

        let body = serde_json::to_string(&json_rpc_request)?;

        let json = &self.fetch(url, "POST", &body[..]).await.map_err(|e| {
            // We are serializing the JsValue to pass it as a string to the Error
            // it is a bit meh, but we do not know exact shape of JsValue
            let error_js_str = js_sys::JSON::stringify(&e).expect("JsValue to be serializable");
            let error_str: String = error_js_str.into();
            JsError::new(&error_str)
        })?;

        let abci_response: AbciQueryResult = JsValue::into_serde(&json)?;

        Ok(abci_response.result.response)
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
        let response = &self
            .abci_query(&self.url, &path, data, height, prove)
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
}

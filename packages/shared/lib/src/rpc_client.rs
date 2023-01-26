use js_sys::JSON::stringify;
use namada::ledger::queries::{Client, EncodedResponseQuery};
use namada::tendermint::abci::{Code, Path};

use namada::tendermint_rpc::{Response as RpcResponse, SimpleRequest};
use namada::types::storage::BlockHeight;
use namada::{tendermint, tendermint_rpc::error::Error as RpcError};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

use crate::utils::console_log_any;

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

#[wasm_bindgen(module = "/src/rpc.js")]
extern "C" {
    /// this is the signature of the js method that is used to perform
    /// the calls to the chain
    /// `JsValue` here are `string`s in TypeScript
    /// we have to do this conversion  manually
    #[wasm_bindgen(catch, js_name = "call")]
    async fn call(url: JsValue, method: JsValue, body: JsValue) -> Result<JsValue, JsValue>;
}

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
        opts.body(Some(&JsValue::from_str(body)));

        let resp_value = call(
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
        let request_body = request.into_json();
        let response_json = self
            .fetch(&self.url[..], "POST", &request_body)
            .await
            .expect("TODO");

        let test: String = stringify(&response_json)
            .expect("JS object to be serializable")
            .into();
        console_log_any(&"Done");
        R::Response::from_string(&test)
    }
}

use js_sys::JSON::stringify;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::Response;

use namada::ledger::queries::{Client, EncodedResponseQuery};
use namada::tendermint::abci::Code;
use namada::tendermint_rpc::{Response as RpcResponse, SimpleRequest};
use namada::types::storage::BlockHeight;
use namada::{tendermint, tendermint_rpc::error::Error as RpcError};

#[wasm_bindgen(module = "/src/rpc_client.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "wasmFetch")]
    async fn wasmFetch(url: JsValue, method: JsValue, body: JsValue) -> Result<JsValue, JsValue>;
}

pub struct HttpClient {
    url: String,
}

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
            Code::Err(code) => Err(JsError::new(&format!("Error code {}", code))),
        }
    }

    async fn perform<R>(&self, request: R) -> Result<R::Response, RpcError>
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
                RpcError::server(e_str)
            })?;
        let response_json: String = stringify(&response)
            .expect("JS object to be serializable")
            .into();

        R::Response::from_string(&response_json)
    }
}

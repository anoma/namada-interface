use std::collections::HashSet;
use std::error::Error;
use std::fmt::{self, Debug, Display, Formatter};
use std::str::FromStr;

use namada::types::address::Address;
use namada::types::token;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};

use serde::{Deserialize, Serialize};
use borsh::{BorshDeserialize, BorshSerialize };
use gloo_utils::format::JsValueSerdeExt;
use tendermint::abci::{Log, Path, Data};
use tendermint::block;
use tendermint::merkle::proof::Proof;
use tendermint::serializers;

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
    ///
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

#[derive(Debug, Clone, PartialEq)]
pub struct FetchError {
    err: JsValue,
}

impl Display for FetchError {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        Debug::fmt(&self.err, f)
    }
}
impl Error for FetchError {}

impl From<JsValue> for FetchError {
    fn from(value: JsValue) -> Self {
        Self { err: value }
    }
}

#[derive(Debug, Serialize, Deserialize, BorshSerialize, BorshDeserialize)]
pub struct Epoch(u64);

type Prove = bool;

type AbciParams = (Path, Data, block::Height, Prove);


#[derive(Deserialize, Serialize)]
pub struct AbciRequest {
    id: String,
    jsonrpc: String,
    method: String,
    params: AbciParams
}

 pub fn create_json_rpc_request(abci_params: AbciParams) -> AbciRequest {
    AbciRequest{
        id: "".to_owned(),
        jsonrpc: "2.0".to_owned(),
        method: "abci_query".to_owned(),
        params: abci_params
    }
 }

 pub async fn fetch(url: &str, method: &str, body: &str) -> Result<JsValue, JsValue> {
    let mut opts = RequestInit::new();
    opts.method(method);
    opts.mode(RequestMode::Cors);
    opts.body(Some(&JsValue::from(body)));

    let request = Request::new_with_str_and_init(url, &opts)?;
    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;

    let resp: Response = resp_value.dyn_into()?;
    JsFuture::from(resp.json().unwrap()).await
 }

pub async fn abci_query<T>(url: &str, path: &str) -> Result<T, JsValue>
where
    T: BorshDeserialize + Serialize
{
    let path = Path::from_str(path).unwrap();
    let data = Data::from(Vec::new());
    let height = block::Height::from(0 as u8);

    let json_rpc_request = create_json_rpc_request((path, data, height, false));
    let body = serde_json::to_string(&json_rpc_request).unwrap();

    let json = fetch(url, "POST", &body[..]).await?;
    let abci_response: AbciQueryResult = JsValue::into_serde(&json).unwrap();

    match T::try_from_slice(&abci_response.result.response.value[..]) {
        Ok(v) => Ok(v),
        Err(e) => Err(JsValue::from(e.to_string()))
    }
}

fn to_js_result<T>(result: T) -> Result<JsValue, JsValue>
where T: Serialize
{
    match JsValue::from_serde(&result) {
        Ok(v) => Ok(v),
        Err(e) => Err(JsValue::from(e.to_string()))
    }
}


#[wasm_bindgen]
#[derive(Serialize,Deserialize)]
pub struct Abci {
    url: String,
}

#[wasm_bindgen]
impl Abci {

    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Abci {
        Abci { url }
    }

    pub async fn query_all_validators(&self) -> Result<JsValue, JsValue> {
        let validator_addresses = abci_query::<HashSet<Address>>(&self.url, "/vp/pos/validator/addresses").await?;
        let mut result: Vec<(Address, token::Amount)> = Vec::new();

        for address in validator_addresses.into_iter() {
            let stake = &format!("/vp/pos/validator/stake/{}", address)[..];
            let total_bonds = abci_query::<token::Amount>(&self.url, stake).await?;

            result.push((address, total_bonds));
        }

        to_js_result(result)
    }

    pub async fn query_my_validators(&self, owner: &str) -> Result<JsValue, JsValue> {
        let owner = Address::from_str(owner).unwrap();
        let delegated_addresses = abci_query::<HashSet<Address>>(&self.url, &format!("/vp/pos/delegations/{}", owner.encode())[..]).await?;
        let mut result: Vec<(Address, token::Amount)> = Vec::new();

        for address in delegated_addresses.into_iter() {
            let bond_path = &format!("/vp/pos/bond_amount/{}/{}", address, address)[..];
            let total_bonds = abci_query::<token::Amount>(&self.url, bond_path).await?;

            result.push((address, total_bonds));
        }

        to_js_result(result)
    }
}

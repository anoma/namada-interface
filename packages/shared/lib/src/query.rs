use gloo_utils::format::JsValueSerdeExt;
use namada::ledger::queries::RPC;
use namada::types::address::Address;
use namada::types::token::Amount;
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;

#[wasm_bindgen]
pub struct Query {
    client: HttpClient,
}

#[wasm_bindgen]
impl Query {
    fn to_js_result<T>(result: T) -> Result<JsValue, JsError>
    where
        T: Serialize,
    {
        match JsValue::from_serde(&result) {
            Ok(v) => Ok(v),
            Err(e) => Err(JsError::new(&e.to_string())),
        }
    }
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Query {
        console_error_panic_hook::set_once();
        let client = HttpClient::new(url);
        Query { client }
    }

    pub async fn query_epoch(&self) -> Result<JsValue, JsError> {
        let epoch = RPC.shell().epoch(&self.client).await?;

        Query::to_js_result(epoch)
    }

    pub async fn query_all_validators(&self) -> Result<JsValue, JsError> {
        let validator_addresses = RPC
            .vp()
            .pos()
            .validator_addresses(&self.client, &None)
            .await?;

        let mut result: Vec<(Address, Amount)> = Vec::new();

        for address in validator_addresses.into_iter() {
            let total_bonds = RPC
                .vp()
                .pos()
                .validator_stake(&self.client, &address, &None)
                .await?;

            result.push((address, total_bonds));
        }

        Query::to_js_result(result)
    }

    pub async fn query_my_validators(
        &self,
        owner_addresses: Box<[JsValue]>,
    ) -> Result<JsValue, JsError> {
        let owner_addresses: Vec<Address> = owner_addresses
            .into_iter()
            .map(|address| {
                let address_str = &(address.as_string().unwrap()[..]);
                Address::from_str(address_str).unwrap()
            })
            .collect();

        let mut validators_per_address: HashMap<Address, HashSet<Address>> = HashMap::new();

        for address in owner_addresses.into_iter() {
            let validators = RPC.vp().pos().delegations(&self.client, &address).await?;

            validators_per_address.insert(address, validators);
        }

        //TODO: Change to Vec of structs
        //Owner, Validator, Amount
        let mut result: Vec<(Address, Address, Amount)> = Vec::new();

        for (owner, validators) in validators_per_address.into_iter() {
            for validator in validators.into_iter() {
                let total_bonds = RPC
                    .vp()
                    .pos()
                    .bond_amount(&self.client, &owner, &validator, &None)
                    .await?;

                result.push((owner.clone(), validator, total_bonds));
            }
        }

        Query::to_js_result(result)
    }
}

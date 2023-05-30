use masp_primitives::{transaction::components::Amount, zip32::ExtendedFullViewingKey};
use namada::ledger::masp::ShieldedContext;
use namada::ledger::queries::RPC;
use namada::ledger::rpc::{get_public_key, get_token_balance};
use namada::types::{
    address::Address,
    masp::ExtendedViewingKey,
    token::{self, TokenAddress},
    uint::I256,
};
use std::collections::{HashMap, HashSet};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;
use crate::sdk::masp;
use crate::utils::{set_panic_hook, to_js_result};

#[wasm_bindgen]
/// Represents an API for querying the ledger
pub struct Query {
    client: HttpClient,
}

#[wasm_bindgen]
impl Query {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Query {
        set_panic_hook();
        let client = HttpClient::new(url);
        Query { client }
    }

    /// Gets current epoch
    ///
    /// # Errors
    ///
    /// Returns an error if the RPC call fails
    pub async fn query_epoch(&self) -> Result<JsValue, JsError> {
        let epoch = RPC.shell().epoch(&self.client).await?;

        to_js_result(epoch)
    }

    /// Gets all active validators with their total bonds
    ///
    /// # Errors
    ///
    /// Returns an error if the RPC call fails
    pub async fn query_all_validators(&self) -> Result<JsValue, JsError> {
        let validator_addresses = RPC
            .vp()
            .pos()
            .validator_addresses(&self.client, &None)
            .await?;

        let mut result: Vec<(Address, token::Amount)> = Vec::new();

        for address in validator_addresses.into_iter() {
            let total_bonds = RPC
                .vp()
                .pos()
                .validator_stake(&self.client, &address, &None)
                .await?;

            result.push((address, total_bonds.unwrap_or(token::Amount::zero())));
        }

        to_js_result(result)
    }

    /// Gets all delegations for every provided address.
    /// Returns a tuple of (owner_address, validator_address, total_bonds)
    ///
    /// # Arguments
    ///
    /// * `owner_addresses` - Account address in form of bech32, base64 encoded string
    ///
    /// # Errors
    ///
    /// Panics if address can't be deserialized
    pub async fn query_my_validators(
        &self,
        owner_addresses: Box<[JsValue]>,
    ) -> Result<JsValue, JsError> {
        let owner_addresses: Vec<Address> = owner_addresses
            .into_iter()
            .map(|address| {
                //TODO: Handle errors(unwrap)
                let address_str = &(address.as_string().unwrap()[..]);
                Address::from_str(address_str).unwrap()
            })
            .collect();

        let mut validators_per_address: HashMap<Address, HashSet<Address>> = HashMap::new();

        for address in owner_addresses.into_iter() {
            let validators = RPC
                .vp()
                .pos()
                .delegation_validators(&self.client, &address)
                .await?;

            validators_per_address.insert(address, validators);
        }

        //TODO: Change to Vec of structs
        //Owner, Validator, Amount
        let mut result: Vec<(Address, Address, token::Amount)> = Vec::new();

        for (owner, validators) in validators_per_address.into_iter() {
            for validator in validators.into_iter() {
                let total_bonds = RPC
                    .vp()
                    .pos()
                    .bond(&self.client, &owner, &validator, &None)
                    .await?;

                result.push((owner.clone(), validator, total_bonds));
            }
        }

        to_js_result(result)
    }

    fn get_decoded_balance(
        decoded_balance: HashMap<TokenAddress, I256>,
    ) -> Vec<(Address, token::Amount)> {
        let mut result = Vec::new();

        decoded_balance
            .iter()
            .into_iter()
            .for_each(|(token_address, change)| {
                let amount = token::Amount::from_change(*change);
                result.push((token_address.address.clone(), amount));
            });

        result
    }

    /// Queries transparent balance for a given address
    ///
    /// # Arguments
    ///
    /// * `owner` - Account address in form of bech32, base64 encoded string
    async fn query_transparent_balance(&self, owner: Address) -> Vec<(Address, token::Amount)> {
        //TODO: Move hardoced tokens somewhere else
        let tokens: HashSet<Address> = HashSet::from([Address::from_str(
            "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
        )
        .unwrap(), Address::from_str(
            "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9",
        )
        .unwrap(), Address::from_str(
            "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
        )
        .unwrap()]);

        let mut result = vec![];
        for token in tokens {
            let balances = get_token_balance(&self.client, &token, &owner)
                .await
                .unwrap_or(token::Amount::zero());
            result.push((token, balances));
        }
        result
    }

    /// Queries shielded balance for a given extended viewing key
    ///
    /// # Arguments
    ///
    /// * `xvk` - Extended viewing key
    async fn query_shielded_balance(
        &self,
        xvk: ExtendedViewingKey,
    ) -> Vec<(Address, token::Amount)> {
        let viewing_key = ExtendedFullViewingKey::from(xvk).fvk.vk;
        // We are recreating shielded context to avoid multiple mutable borrows
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
        let balance = Amount::from(balance);
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
        let result: Vec<(Address, String)> = result
            .into_iter()
            .map(|(addr, amount)| (addr, amount.to_string_native()))
            .collect();

        to_js_result(result)
    }

    pub async fn query_public_key(&self, address: &str) -> Result<JsValue, JsError> {
        let addr = Address::from_str(address).map_err(JsError::from)?;
        let pk = get_public_key(&self.client, &addr).await;

        let result = match pk {
            Some(v) => Some(v.to_string()),
            None => None,
        };

        to_js_result(result)
    }
}

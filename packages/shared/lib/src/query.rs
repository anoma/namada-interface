use masp_primitives::transaction::components::I128Sum;
use masp_primitives::zip32::ExtendedFullViewingKey;
use namada::core::ledger::governance::storage::keys as gov_storage;
use namada::core::ledger::governance::storage::proposal::ProposalType;
use namada::ledger::eth_bridge::bridge_pool::query_signed_bridge_pool;
use namada::ledger::queries::RPC;
use namada::ledger::rpc::{
    format_denominated_amount, get_public_key_at, get_token_balance, query_storage_value,
};
use namada::ledger::storage_api::governance::get_proposal_votes;
use namada::proof_of_stake::Epoch;
use namada::sdk::masp::ShieldedContext;
use namada::sdk::rpc::{
    format_denominated_amount, get_public_key_at, get_token_balance, query_epoch,
};
use namada::types::control_flow::ProceedOrElse;
use namada::types::eth_bridge_pool::TransferToEthereum;
use namada::types::{
    address::Address,
    masp::ExtendedViewingKey,
    token::{self},
    uint::I256,
};
use serde::Serialize;
use std::collections::{HashMap, HashSet};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;
use crate::sdk::{io::WebIo, masp};
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

    /// Gets all active validator addresses
    ///
    /// # Errors
    ///
    /// Returns an error if the RPC call fails
    pub async fn query_all_validator_addresses(&self) -> Result<JsValue, JsError> {
        let validator_addresses = RPC
            .vp()
            .pos()
            .validator_addresses(&self.client, &None)
            .await?;

        to_js_result(validator_addresses)
    }

    /// Gets total bonds by validator address
    ///
    /// # Errors
    ///
    /// Returns an error if the RPC call fails
    pub async fn query_total_bonds(&self, address: String) -> Result<JsValue, JsError> {
        let address = Address::from_str(&address)?;

        let total_bonds = RPC
            .vp()
            .pos()
            .validator_stake(&self.client, &address, &None)
            .await?;

        to_js_result(total_bonds)
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

        let mut result: Vec<(Address, Address, String, String, String)> = Vec::new();

        let epoch = query_epoch(&self.client).await?;
        for (owner, validators) in validators_per_address.into_iter() {
            for validator in validators.into_iter() {
                let owner_option = &Some(owner.clone());
                let validator_option = &Some(validator.clone());

                let enriched = RPC
                    .vp()
                    .pos()
                    .enriched_bonds_and_unbonds(&self.client, epoch, owner_option, validator_option)
                    .await?;

                result.push((
                    owner.clone(),
                    validator,
                    enriched.bonds_total.to_string_native(),
                    enriched.unbonds_total.to_string_native(),
                    enriched.total_withdrawable.to_string_native(),
                ));
            }
        }

        to_js_result(result)
    }

    fn get_decoded_balance(
        decoded_balance: HashMap<Address, I256>,
    ) -> Vec<(Address, token::Amount)> {
        let mut result = Vec::new();

        decoded_balance
            .iter()
            .into_iter()
            .for_each(|(token_address, change)| {
                let amount = token::Amount::from_change(*change);
                result.push((token_address.clone(), amount));
            });

        result
    }

    pub async fn query_staking_positions(
        &self,
        owner_addresses: Box<[JsValue]>,
    ) -> Result<JsValue, JsError> {
        let owner_addresses: Vec<Address> = owner_addresses
            .into_iter()
            .filter_map(|address| address.as_string())
            .filter_map(|address| Address::from_str(&address).ok())
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

        let mut bonds = vec![];
        let mut unbonds = vec![];

        let epoch = query_epoch(&self.client).await?;
        for (owner, validators) in validators_per_address.into_iter() {
            for validator in validators.into_iter() {
                let owner_option = &Some(owner.clone());
                let validator_option = &Some(validator.clone());

                let enriched = RPC
                    .vp()
                    .pos()
                    .enriched_bonds_and_unbonds(&self.client, epoch, owner_option, validator_option)
                    .await?;

                for (bond_id, details) in &enriched.data {
                    for bond in &details.data.bonds {
                        bonds.push((
                            bond_id.source.clone(),
                            bond_id.validator.clone(),
                            bond.amount.to_string_native(),
                            bond.start.to_string(),
                        ));
                    }

                    for unbond in &details.data.unbonds {
                        unbonds.push((
                            bond_id.source.clone(),
                            bond_id.validator.clone(),
                            unbond.amount.to_string_native(),
                            unbond.start.to_string(),
                            unbond.withdraw.to_string(),
                        ));
                    }
                }
            }
        }

        to_js_result((bonds, unbonds))
    }

    /// Queries transparent balance for a given address
    ///
    /// # Arguments
    ///
    /// * `owner` - Account address in form of bech32, base64 encoded string
    async fn query_transparent_balance(
        &self,
        owner: Address,
    ) -> Result<Vec<(Address, token::Amount)>, JsError> {
        //TODO: Move hardoced tokens somewhere else
        let tokens: HashSet<Address> = HashSet::from([Address::from_str(
            "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
        )?, Address::from_str(
            "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9",
        )?, Address::from_str(
            "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
        )?, Address::from_str(
            "atest1v46xsw368psnwwf3xcerqeryxcervvpsxuukye3cxsukgce4x5mrwctyvvekvvnxv33nxvfc0kmacx",
        )?,
        Address::from_str(
            "atest1de6hgw368pqnwwf3xcerqeryxcervvpsxuu5y33cxsu5gce4x5mrwc2ygve5vvjxv3pnxvfcq8rzzq",
        )?]);

        let mut result = vec![];
        for token in tokens {
            let balances = get_token_balance(&self.client, &token, &owner).await?;
            result.push((token, balances));
        }

        Ok(result)
    }

    /// Queries shielded balance for a given extended viewing key
    ///
    /// # Arguments
    ///
    /// * `xvk` - Extended viewing key
    async fn query_shielded_balance(
        &self,
        xvk: ExtendedViewingKey,
    ) -> Result<Vec<(Address, token::Amount)>, JsError> {
        let viewing_key = ExtendedFullViewingKey::from(xvk).fvk.vk;
        // We are recreating shielded context to avoid multiple mutable borrows
        let mut shielded: ShieldedContext<masp::WebShieldedUtils> = ShieldedContext::default();

        let _ = shielded.load();
        let fvks: Vec<_> = vec![xvk]
            .iter()
            .map(|fvk| ExtendedFullViewingKey::from(*fvk).fvk.vk)
            .collect();

        shielded.fetch(&self.client, &[], &fvks).await?;

        let epoch = query_epoch(&self.client).await?;
        let balance = shielded
            .compute_exchanged_balance::<_, WebIo>(&self.client, &viewing_key, epoch)
            .await?
            .expect("context should contain viewing key");
        let decoded_balance = shielded
            .decode_amount(&self.client, I128Sum::from(balance), epoch)
            .await;

        Ok(Self::get_decoded_balance(decoded_balance))
    }

    pub async fn query_balance(&self, owner: String) -> Result<JsValue, JsError> {
        let result = match Address::from_str(&owner) {
            Ok(addr) => self.query_transparent_balance(addr).await,
            Err(e1) => match ExtendedViewingKey::from_str(&owner) {
                Ok(xvk) => self.query_shielded_balance(xvk).await,
                Err(e2) => return Err(JsError::new(&format!("{} {}", e1, e2))),
            },
        }?;

        let mut mapped_result: Vec<(Address, String)> = vec![];
        for (token, amount) in result {
            mapped_result.push((
                token.clone(),
                format_denominated_amount::<_, WebIo>(&self.client, &token, amount)
                    .await
                    .clone(),
            ))
        }

        to_js_result(mapped_result)
    }

    pub async fn query_public_key(&self, address: &str) -> Result<JsValue, JsError> {
        let addr = Address::from_str(address).map_err(JsError::from)?;
        let pk = get_public_key_at(&self.client, &addr, 0).await?;

        let result = match pk {
            Some(v) => Some(v.to_string()),
            None => None,
        };

        to_js_result(result)
    }

    pub async fn query_signed_bridge_pool(
        &self,
        owner_addresses: Box<[JsValue]>,
    ) -> Result<JsValue, JsError> {
        let bridge_pool = query_signed_bridge_pool::<_, WebIo>(&self.client)
            .await
            .proceed_or_else(|| JsError::new("TODO:"))?;

        let owner_addresses: Vec<Address> = owner_addresses
            .into_iter()
            .filter_map(|address| address.as_string())
            .filter_map(|address| Address::from_str(&address).ok())
            .collect();

        let result: Vec<TransferToEthereum> = bridge_pool
            .into_iter()
            .filter_map(|(_hash, pending_transfer)| {
                if owner_addresses.contains(&pending_transfer.transfer.sender) {
                    Some(pending_transfer.transfer)
                } else {
                    None
                }
            })
            .collect();

        to_js_result(result)
    }

    pub async fn query_proposals(&self) -> Result<JsValue, JsError> {
        async fn print_proposal<C: namada::ledger::queries::Client + Sync>(
            client: &C,
            id: u64,
            current_epoch: Epoch,
        ) -> Option<ProposalInfo> {
            let author_key = gov_storage::get_author_key(id);
            let start_epoch_key = gov_storage::get_voting_start_epoch_key(id);
            let end_epoch_key = gov_storage::get_voting_end_epoch_key(id);
            let proposal_type_key = gov_storage::get_proposal_type_key(id);

            let author = query_storage_value::<C, Address>(client, &author_key).await?;
            let start_epoch = query_storage_value::<C, Epoch>(client, &start_epoch_key).await?;
            let end_epoch = query_storage_value::<C, Epoch>(client, &end_epoch_key).await?;
            let proposal_type =
                query_storage_value::<C, ProposalType>(client, &proposal_type_key).await?;

            let grace_epoch_key = gov_storage::get_grace_epoch_key(id);
            let grace_epoch = query_storage_value::<C, Epoch>(client, &grace_epoch_key).await?;

            let content_key = gov_storage::get_content_key(id);
            let content =
                query_storage_value::<C, HashMap<String, String>>(client, &content_key).await?;

            let votes = get_proposal_votes(client, start_epoch, id);
            let total_stake = get_total_staked_tokens(client, start_epoch)
                .await
                .try_into()
                .unwrap();
            let status;
            let mut yes_votes = None;
            let mut total_voting_power = None;
            let mut result = None;

            if start_epoch > current_epoch {
                status = "pending";
            } else if start_epoch <= current_epoch && current_epoch <= end_epoch {
                status = "on-going";
                match utils::compute_tally(votes, total_stake, &proposal_type) {
                    Ok(partial_proposal_result) => {
                        yes_votes = Some(partial_proposal_result.total_yay_power);
                        total_voting_power = Some(partial_proposal_result.total_voting_power);
                    }
                    Err(msg) => {
                        eprintln!("Error in tally computation: {}", msg)
                    }
                }
            } else {
                status = "done";
                match utils::compute_tally(votes, total_stake, &proposal_type) {
                    Ok(proposal_result) => {
                        yes_votes = Some(proposal_result.total_yay_power);
                        total_voting_power = Some(proposal_result.total_voting_power);
                        result = match proposal_result.result {
                            TallyResult::Passed(_) => Some("passed".to_string()),
                            TallyResult::Rejected => Some("rejected".to_string()),
                        };
                    }
                    Err(msg) => {
                        eprintln!("Error in tally computation: {}", msg)
                    }
                }
            }

            let res = ProposalInfo {
                id: id.to_string(),
                proposal_type,
                author,
                start_epoch,
                end_epoch,
                grace_epoch,
                content,
                status: status.to_string(),
                yes_votes: yes_votes.map(|v| v.to_string()),
                total_voting_power: total_voting_power.map(|v| v.to_string()),
                result,
            };

            Some(res)
        }

        let last_proposal_id_key = gov_storage::get_counter_key();
        let last_proposal_id =
            query_storage_value::<HttpClient, u64>(&self.client, &last_proposal_id_key)
                .await
                .unwrap();

        let current_epoch = namada::ledger::rpc::query_epoch(&self.client).await?;
        let mut results = vec![];

        for id in 0..last_proposal_id {
            let v = print_proposal(&self.client, id, current_epoch)
                .await
                .expect("WORK");
            results.push(v);
        }

        to_js_result(results)
    }
}

#[derive(Serialize)]
struct ProposalInfo {
    id: String,
    proposal_type: ProposalType,
    author: Address,
    start_epoch: Epoch,
    end_epoch: Epoch,
    grace_epoch: Epoch,
    content: HashMap<String, String>,
    status: String,
    yes_votes: Option<String>,
    total_voting_power: Option<String>,
    result: Option<String>,
}

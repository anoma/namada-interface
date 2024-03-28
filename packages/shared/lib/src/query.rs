use js_sys::Uint8Array;
use namada::address::Address;
use namada::core::borsh::BorshSerialize;
use namada::eth_bridge_pool::TransferToEthereum;
use namada::governance::storage::keys as governance_storage;
use namada::governance::utils::{compute_proposal_result, ProposalVotes, TallyVote, VotePower};
use namada::governance::{ProposalType, ProposalVote};
use namada::ledger::eth_bridge::bridge_pool::query_signed_bridge_pool;
use namada::ledger::parameters::storage;
use namada::ledger::queries::RPC;
use namada::masp::ExtendedViewingKey;
use namada::proof_of_stake::Epoch;
use namada::sdk::masp::{DefaultLogger, ShieldedContext};
use namada::sdk::masp_primitives::asset_type::AssetType;
use namada::sdk::masp_primitives::sapling::ViewingKey;
use namada::sdk::masp_primitives::transaction::components::ValueSum;
use namada::sdk::masp_primitives::zip32::ExtendedFullViewingKey;
use namada::sdk::rpc::{
    format_denominated_amount, get_public_key_at, get_token_balance, get_total_staked_tokens,
    query_epoch, query_native_token, query_proposal_by_id, query_proposal_votes,
    query_storage_value,
};
use namada::token;
use namada::uint::I256;
use std::collections::{BTreeMap, HashMap, HashSet};
use std::str::FromStr;
use wasm_bindgen::prelude::*;

use crate::rpc_client::HttpClient;
use crate::sdk::{io::WebIo, masp};
use crate::types::query::ProposalInfo;
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
    /// Returns a tuple of:
    /// (owner_address, validator_address, total_bonds, total_unbonds, withdrawable)
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
        decoded_balance: (ValueSum<Address, I256>, ValueSum<AssetType, i128>),
    ) -> Vec<(Address, token::Amount)> {
        let mut result = Vec::new();

        for (token_addr, amount) in decoded_balance.0.components() {
            let amount = token::Amount::from_change(*amount);
            result.push((token_addr.clone(), amount));
        }

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
        tokens: Box<[JsValue]>,
    ) -> Result<Vec<(Address, token::Amount)>, JsError> {
        let tokens: Vec<Address> = tokens
            .into_iter()
            .map(|address| {
                let address_str = &(address.as_string().unwrap()[..]);
                Address::from_str(address_str).unwrap()
            })
            .collect();

        let mut result = vec![];
        for token in tokens {
            let balances = get_token_balance(&self.client, &token, &owner).await?;
            result.push((token, balances));
        }

        Ok(result)
    }

    pub async fn shielded_sync(&self, owners: Box<[JsValue]>) -> Result<(), JsError> {
        let owners: Vec<ViewingKey> = owners
            .into_iter()
            .filter_map(|owner| owner.as_string())
            .map(|o| {
                ExtendedFullViewingKey::from(ExtendedViewingKey::from_str(&o).unwrap())
                    .fvk
                    .vk
            })
            .collect();

        let mut shielded: ShieldedContext<masp::JSShieldedUtils> = ShieldedContext::default();

        let _ = shielded.load().await?;
        let _ = shielded
            .precompute_asset_types(
                &self.client,
                vec![&Address::from_str("tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e").unwrap()],
            )
            .await?;

        let _ = shielded.save().await?;

        shielded
            .fetch(
                &self.client,
                &DefaultLogger::new(&WebIo),
                None,
                None,
                1,
                &[],
                &owners,
            )
            .await?;

        Ok(())
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
        let mut shielded: ShieldedContext<masp::JSShieldedUtils> = ShieldedContext::default();
        shielded.load().await?;

        let epoch = query_epoch(&self.client).await?;
        let balance = shielded
            .compute_exchanged_balance(&self.client, &WebIo, &viewing_key, epoch)
            .await?;

        let res = match balance {
            Some(balance) => {
                let decoded_balance = shielded
                    .decode_combine_sum_to_epoch(&self.client, balance, epoch)
                    .await;

                Self::get_decoded_balance(decoded_balance)
            }
            None => vec![],
        };

        Ok(res)
    }

    pub async fn query_balance(
        &self,
        owner: String,
        tokens: Box<[JsValue]>,
    ) -> Result<JsValue, JsError> {
        let result = match Address::from_str(&owner) {
            Ok(addr) => self.query_transparent_balance(addr, tokens).await,
            Err(e1) => match ExtendedViewingKey::from_str(&owner) {
                Ok(xvk) => self.query_shielded_balance(xvk).await,
                Err(e2) => return Err(JsError::new(&format!("{} {}", e1, e2))),
            },
        }?;

        let mut mapped_result: Vec<(Address, String)> = vec![];
        for (token, amount) in result {
            mapped_result.push((
                token.clone(),
                format_denominated_amount(&self.client, &WebIo, &token, amount)
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
        let bridge_pool = query_signed_bridge_pool(&self.client, &WebIo).await?;

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

    /// Returns a list of all proposals
    pub async fn query_proposals(&self) -> Result<Uint8Array, JsError> {
        let last_proposal_id_key = governance_storage::get_counter_key();
        let last_proposal_id =
            query_storage_value::<HttpClient, u64>(&self.client, &last_proposal_id_key)
                .await
                .unwrap();

        let from_id = if last_proposal_id > 10 {
            last_proposal_id - 10
        } else {
            0
        };

        let mut proposals: Vec<ProposalInfo> = vec![];
        let epoch = RPC.shell().epoch(&self.client).await?;

        for id in from_id..last_proposal_id {
            let proposal = query_proposal_by_id(&self.client, id)
                .await
                .unwrap()
                .expect("Proposal should be written to storage.");
            let votes = compute_proposal_votes(&self.client, id, proposal.voting_end_epoch).await;
            let total_voting_power =
                get_total_staked_tokens(&self.client, proposal.voting_end_epoch)
                    .await
                    .unwrap();
            //TODO: for now we assume that interface does not support steward accounts
            let tally_type = proposal.get_tally_type(false);

            let proposal_type = match proposal.r#type {
                ProposalType::PGFSteward(_) => "pgf_steward",
                ProposalType::PGFPayment(_) => "pgf_payment",
                ProposalType::Default(_) => "default",
            };
            let status =
                if proposal.voting_start_epoch <= epoch && proposal.voting_end_epoch >= epoch {
                    "ongoing"
                } else if proposal.voting_end_epoch < epoch {
                    "finished"
                } else {
                    "upcoming"
                };

            let content = serde_json::to_string(&proposal.content)?;

            let proposal_result = compute_proposal_result(votes, total_voting_power, tally_type);

            let proposal_info = ProposalInfo {
                id: proposal.id.to_string(),
                proposal_type: proposal_type.to_string(),
                author: proposal.author.to_string(),
                start_epoch: proposal.voting_start_epoch.0,
                end_epoch: proposal.voting_end_epoch.0,
                grace_epoch: proposal.grace_epoch.0,
                content,
                status: status.to_string(),
                result: proposal_result.result.to_string(),
                total_voting_power: proposal_result.total_voting_power.to_string_native(),
                total_yay_power: proposal_result.total_yay_power.to_string_native(),
                total_nay_power: proposal_result.total_nay_power.to_string_native(),
            };

            proposals.push(proposal_info);
        }

        let mut writer = vec![];
        BorshSerialize::serialize(&proposals, &mut writer)?;

        Ok(Uint8Array::from(writer.as_slice()))
    }

    /// Returns a list of all delegations for given addresses and epoch
    ///
    /// # Arguments
    ///
    /// * `addresses` - delegators addresses
    /// * `epoch` - epoch in which we want to query delegations
    pub async fn get_total_delegations(
        &self,
        addresses: Box<[JsValue]>,
        epoch: Option<u64>,
    ) -> Result<JsValue, JsError> {
        let addresses: Vec<Address> = addresses
            .into_iter()
            .filter_map(|address| address.as_string())
            .filter_map(|address| Address::from_str(&address).ok())
            .collect();

        let epoch = epoch.map(Epoch);

        let mut delegations: HashMap<Address, token::Amount> = HashMap::new();

        for address in addresses.into_iter() {
            let validators: HashMap<Address, token::Amount> = RPC
                .vp()
                .pos()
                .delegations(&self.client, &address, &epoch)
                .await?;
            let sum_of_delegations = validators
                .into_values()
                .fold(token::Amount::zero(), |acc, curr| {
                    acc.checked_add(curr).expect("Amount overflow")
                });

            delegations.insert(address, sum_of_delegations);
        }

        to_js_result(delegations)
    }

    /// Returns list of delegators that already voted on a proposal
    ///
    /// # Arguments
    ///
    /// * `proposal_id` - id of proposal to get delegators votes from
    pub async fn delegators_votes(&self, proposal_id: u64) -> Result<JsValue, JsError> {
        let votes = query_proposal_votes(&self.client, proposal_id).await?;
        let res: Vec<(Address, bool)> = votes
            .into_iter()
            .map(|vote| {
                let is_yay = match vote.data {
                    ProposalVote::Yay => true,
                    ProposalVote::Nay => false,
                    ProposalVote::Abstain => false,
                };
                (vote.delegator, is_yay)
            })
            .collect();

        to_js_result(res)
    }

    pub async fn query_gas_costs(&self) -> Result<JsValue, JsError> {
        let key = storage::get_gas_cost_key();
        let gas_cost_table =
            query_storage_value::<HttpClient, BTreeMap<Address, token::Amount>>(&self.client, &key)
                .await
                .expect("Parameter should be defined.");

        let mut result: Vec<(String, String)> = Vec::new();

        for (token, gas_cost) in gas_cost_table {
            result.push((token.to_string(), gas_cost.to_string_native()));
        }

        to_js_result(result)
    }

    pub async fn query_native_token(&self) -> Result<JsValue, JsError> {
        let address = query_native_token(&self.client).await?;
        to_js_result(address)
    }
}

//TODO: remove after moving this fn from apps to shared
pub async fn compute_proposal_votes(
    client: &HttpClient,
    proposal_id: u64,
    epoch: Epoch,
) -> ProposalVotes {
    let votes = query_proposal_votes(client, proposal_id).await.unwrap();

    let mut validators_vote: HashMap<Address, TallyVote> = HashMap::default();
    let mut validator_voting_power: HashMap<Address, VotePower> = HashMap::default();
    let mut delegators_vote: HashMap<Address, TallyVote> = HashMap::default();
    let mut delegator_voting_power: HashMap<Address, HashMap<Address, VotePower>> =
        HashMap::default();

    for vote in votes {
        if vote.is_validator() {
            let validator_stake = RPC
                .vp()
                .pos()
                .validator_stake(client, &vote.validator.clone(), &Some(epoch))
                .await
                .expect("Validator stake should be present")
                .unwrap_or_default();

            validators_vote.insert(vote.validator.clone(), vote.data.into());
            validator_voting_power.insert(vote.validator, validator_stake);
        } else {
            let delegator_stake = RPC
                .vp()
                .pos()
                .bond_with_slashing(client, &vote.delegator, &vote.validator, &Some(epoch))
                .await
                .expect("Delegator stake should be present");

            delegators_vote.insert(vote.delegator.clone(), vote.data.into());
            delegator_voting_power
                .entry(vote.delegator.clone())
                .or_default()
                .insert(vote.validator, delegator_stake);
        }
    }

    ProposalVotes {
        validators_vote,
        validator_voting_power,
        delegators_vote,
        delegator_voting_power,
    }
}

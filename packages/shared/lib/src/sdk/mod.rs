mod args;
pub mod io;
pub mod masp;
mod signature;
mod transaction;
mod tx;
mod wallet;

use self::io::WebIo;
use crate::rpc_client::HttpClient;
use crate::utils::set_panic_hook;
#[cfg(feature = "web")]
use crate::utils::to_bytes;
use crate::utils::to_js_result;
use args::generate_masp_build_params;
use gloo_utils::format::JsValueSerdeExt;
use namada_sdk::address::{Address, MASP};
use namada_sdk::args::{GenIbcShieldingTransfer, InputAmount, Query, TxExpiration};
use namada_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use namada_sdk::collections::HashSet;
use namada_sdk::eth_bridge::bridge_pool::build_bridge_pool_tx;
use namada_sdk::hash::Hash;
use namada_sdk::ibc::convert_masp_tx_to_ibc_memo;
use namada_sdk::ibc::core::host::types::identifiers::{ChannelId, PortId};
use namada_sdk::io::NamadaIo;
use namada_sdk::key::common::PublicKey;
use namada_sdk::key::{common, ed25519, SigScheme};
use namada_sdk::masp::{MaspFeeData, MaspTransferData, ShieldedContext, ShieldedTransfer};
use namada_sdk::rpc::{query_epoch, InnerTxResult};
use namada_sdk::signing::SigningTxData;
use namada_sdk::string_encoding::Format;
use namada_sdk::tendermint_rpc::Url;
use namada_sdk::token::{DenominatedAmount, Transfer};
use namada_sdk::tx::{
    build_batch, build_bond, build_claim_rewards, build_ibc_transfer, build_redelegation,
    build_reveal_pk, build_shielded_transfer, build_shielding_transfer, build_transparent_transfer,
    build_unbond, build_unshielding_transfer, build_vote_proposal, build_withdraw,
    data::compute_inner_tx_hash, either::Either, gen_ibc_shielding_transfer, process_tx,
    ProcessTxResponse, Tx,
};
use namada_sdk::wallet::alias::Alias;
use namada_sdk::wallet::{Store, Wallet};
use namada_sdk::{Namada, NamadaImpl, PaymentAddress, TransferTarget};
use std::str::FromStr;
use wallet::JSWalletUtils;
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

// Maximum number of spend description randomness parameters that can be
// generated on the hardware wallet. It is hard to compute the exact required
// number because a given MASP source could be distributed amongst several
// notes.
const MAX_HW_SPEND: usize = 15;
// Maximum number of convert description randomness parameters that can be
// generated on the hardware wallet. It is hard to compute the exact required
// number because the number of conversions that are used depends on the
// protocol's current state.
const MAX_HW_CONVERT: usize = 15;
// Maximum number of output description randomness parameters that can be
// generated on the hardware wallet. It is hard to compute the exact required
// number because the number of outputs depends on the number of dummy outputs
// introduced.
const MAX_HW_OUTPUT: usize = 15;

/// Represents the Sdk public API.
#[wasm_bindgen]
pub struct Sdk {
    namada: NamadaImpl<HttpClient, wallet::JSWalletUtils, masp::JSShieldedUtils, WebIo>,
    rpc_url: String,
}

#[wasm_bindgen]
/// Sdk mostly wraps the logic of the Sdk struct members, making it a part of public API.
/// For more details, navigate to the corresponding modules.
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String, native_token: String, path_or_db_name: String) -> Self {
        set_panic_hook();
        let client: HttpClient = HttpClient::new(url.clone());
        let wallet: Wallet<wallet::JSWalletUtils> = Wallet::new(
            wallet::JSWalletUtils::new_utils(&path_or_db_name),
            Store::default(),
        );
        let shielded_ctx: ShieldedContext<masp::JSShieldedUtils> = ShieldedContext::default();

        let namada = NamadaImpl::native_new(
            client,
            wallet,
            shielded_ctx.into(),
            WebIo,
            //NAM address
            Address::from_str(&native_token).unwrap(),
        );

        Sdk {
            namada,
            rpc_url: url,
        }
    }

    pub async fn has_masp_params() -> Result<JsValue, JsValue> {
        let has = has_masp_params().await?;

        Ok(js_sys::Boolean::from(has.as_bool().unwrap()).into())
    }

    pub async fn fetch_and_store_masp_params(url: Option<String>) -> Result<(), JsValue> {
        fetch_and_store_masp_params(url).await?;
        Ok(())
    }

    #[cfg(feature = "web")]
    pub async fn load_masp_params(&self, _db_name: JsValue) -> Result<(), JsValue> {
        // _dn_name is not used in the web version for a time being
        let params = get_masp_params().await?;
        let params_iter = js_sys::try_iter(&params)?.ok_or("Can't iterate over JsValue")?;
        let mut params_bytes = params_iter.map(|p| to_bytes(p.unwrap()));

        let spend = params_bytes.next().unwrap();
        let output = params_bytes.next().unwrap();
        let convert = params_bytes.next().unwrap();

        // We are making sure that there are no more params left
        assert_eq!(params_bytes.next(), None);

        let mut shielded = self.namada.shielded_mut().await;
        *shielded = ShieldedContext::new(masp::JSShieldedUtils::new(spend, output, convert).await?);

        Ok(())
    }

    #[cfg(feature = "nodejs")]
    pub async fn load_masp_params(&self, context_dir: JsValue) -> Result<(), JsValue> {
        let context_dir = context_dir.as_string().unwrap();

        let mut shielded = self.namada.shielded_mut().await;
        *shielded = ShieldedContext::new(masp::JSShieldedUtils::new(&context_dir).await);

        Ok(())
    }

    pub async fn add_spending_key(&self, xsk: String, alias: String) {
        let mut wallet = self.namada.wallet_mut().await;
        wallet::add_spending_key(&mut wallet, xsk, alias)
    }

    pub async fn add_viewing_key(&self, xvk: String, alias: String) {
        let mut wallet = self.namada.wallet_mut().await;
        wallet::add_viewing_key(&mut wallet, xvk, alias)
    }

    pub async fn add_payment_address(&self, pa: String, alias: String) {
        let mut wallet = self.namada.wallet_mut().await;
        wallet::add_payment_address(&mut wallet, pa, alias)
    }

    pub async fn add_default_payment_address(&self, xvk: String, alias: String) {
        let mut wallet = self.namada.wallet_mut().await;
        wallet::add_default_payment_address(&mut wallet, xvk, alias)
    }

    pub async fn add_keypair(&self, secret_key: String, alias: String, password: Option<String>) {
        let mut wallet = self.namada.wallet_mut().await;
        wallet::add_keypair(&mut wallet, secret_key, alias, password)
    }

    pub async fn save_wallet(&self) -> Result<(), JsValue> {
        let wallet = self.namada.wallet_mut().await;
        wallet.save().map_err(JsError::from)?;

        Ok(())
    }

    pub async fn load_wallet(&self) -> Result<(), JsValue> {
        let mut wallet = self.namada.wallet_mut().await;
        wallet.load().map_err(JsError::from)?;

        Ok(())
    }

    pub async fn sign_tx(
        &self,
        tx: Vec<u8>,
        private_key: Option<String>,
        chain_id: Option<String>,
    ) -> Result<JsValue, JsError> {
        let tx: tx::Tx = borsh::from_slice(&tx)?;
        let mut namada_tx: Tx = borsh::from_slice(&tx.tx_bytes())?;

        // If chain_id is provided, validate this against value in Tx header
        if let Some(c) = chain_id {
            if c != namada_tx.header.chain_id.to_string() {
                return Err(JsError::new(&format!(
                    "chain_id {} does not match Tx header chain_id {}",
                    &c,
                    namada_tx.header.chain_id.as_str()
                )));
            }
        }

        let signing_keys = match private_key.clone() {
            Some(private_key) => vec![common::SecretKey::Ed25519(ed25519::SecretKey::from_str(
                &private_key,
            )?)],
            // If no private key is provided, we assume masp source and return empty vec
            None => vec![],
        };

        for signing_tx_data in tx.signing_tx_data()? {
            if let Some(account_public_keys_map) = signing_tx_data.account_public_keys_map.clone() {
                // We only sign the raw header for transfers from transparent source
                if !signing_keys.is_empty() {
                    // Sign the raw header
                    namada_tx.sign_raw(
                        signing_keys.clone(),
                        account_public_keys_map,
                        signing_tx_data.owner.clone(),
                    );
                }
            }
        }

        // The key is either passed private key for transparent sources or the disposable signing
        // key for shielded sources
        let key = signing_keys[0].clone();

        // Sign the fee header
        namada_tx.sign_wrapper(key);

        to_js_result(borsh::to_vec(&namada_tx)?)
    }

    // Broadcast Tx
    pub async fn process_tx(&self, tx_bytes: &[u8], tx_msg: &[u8]) -> Result<JsValue, JsError> {
        let args = args::tx_args_from_slice(tx_msg)?;
        let tx = Tx::try_from_slice(tx_bytes)?;
        let cmts = tx.commitments().clone();
        let wrapper_hash = tx.wrapper_hash();
        let resp = process_tx(&self.namada, &args, tx.clone()).await?;

        let mut batch_tx_results: Vec<tx::BatchTxResult> = vec![];

        // Collect results and return
        match resp {
            ProcessTxResponse::Applied(tx_response) => {
                let code = tx_response.code.to_string();
                let gas_used = tx_response.gas_used.to_string();
                let height = tx_response.height.to_string();
                let info = tx_response.info.to_string();
                let log = tx_response.log.to_string();

                for cmt in cmts {
                    let hash = compute_inner_tx_hash(wrapper_hash.as_ref(), Either::Right(&cmt));

                    if let Some(InnerTxResult::Success(_)) = tx_response.batch_result().get(&hash) {
                        batch_tx_results.push(tx::BatchTxResult::new(hash.to_string(), true));
                    } else {
                        batch_tx_results.push(tx::BatchTxResult::new(hash.to_string(), false));
                    }
                }

                let response = tx::TxResponse::new(
                    code,
                    batch_tx_results,
                    gas_used,
                    wrapper_hash.unwrap().to_string(),
                    height,
                    info,
                    log,
                );
                to_js_result(borsh::to_vec(&response)?)
            }
            _ => Err(JsError::new(&format!(
                "Tx not applied: {}",
                &wrapper_hash.unwrap().to_string()
            ))),
        }
    }

    /// Build a batch Tx from built transactions and return the bytes
    pub fn build_batch(txs: JsValue) -> Result<JsValue, JsError> {
        let mut built_txs: Vec<tx::Tx> = vec![];
        let built_txs_bytes: Vec<Vec<u8>> = txs.into_serde().unwrap();

        for bytes in built_txs_bytes.iter() {
            let tx: tx::Tx = borsh::from_slice(bytes)?;
            built_txs.push(tx);
        }

        // Get wrapper args
        let first_tx = built_txs
            .first()
            .expect("At least one Tx is required for building batches!");

        let args = first_tx.args();

        let mut txs: Vec<(Tx, SigningTxData)> = vec![];

        // Iterate through provided tx::Tx and deserialize bytes to Namada Tx
        for built_tx in built_txs.into_iter() {
            let tx_bytes = built_tx.tx_bytes();
            let signing_tx_data = built_tx.signing_tx_data()?;
            let tx: Tx = Tx::try_from_slice(&tx_bytes)?;
            let first_signing_data = signing_tx_data
                .first()
                .expect("At least one signing data should be present on a Tx");

            txs.push((tx, first_signing_data.to_owned()));
        }

        let (tx, signing_data) = build_batch(txs.clone())?;

        to_js_result(borsh::to_vec(&tx::Tx::new(
            tx,
            &borsh::to_vec(&args)?,
            signing_data,
        )?)?)
    }

    // Append signatures and return tx bytes
    pub fn append_signature(
        &self,
        tx_bytes: &[u8],
        sig_msg_bytes: &[u8],
    ) -> Result<JsValue, JsError> {
        let mut tx: Tx = Tx::try_from_slice(tx_bytes)?;
        let signature::SignatureMsg {
            pubkey,
            raw_indices,
            raw_signature,
            wrapper_indices,
            wrapper_signature,
        } = signature::SignatureMsg::try_from_slice(sig_msg_bytes)?;

        let raw_sig_section =
            signature::construct_signature_section(&pubkey, &raw_indices, &raw_signature, &tx)?;
        tx.add_section(raw_sig_section);

        let wrapper_sig_section = signature::construct_signature_section(
            &pubkey,
            &wrapper_indices,
            &wrapper_signature,
            &tx,
        )?;
        tx.add_section(wrapper_sig_section);

        tx.protocol_filter();

        to_js_result(borsh::to_vec(&tx)?)
    }

    pub async fn build_transparent_transfer(
        &self,
        transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let mut args = args::transparent_transfer_tx_args(transfer_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_transparent_transfer(&self.namada, &mut args).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_shielded_transfer(
        &self,
        shielded_transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let mut args = args::shielded_transfer_tx_args(shielded_transfer_msg, wrapper_tx_msg)?;
        let mut bparams =
            generate_masp_build_params(MAX_HW_SPEND, MAX_HW_CONVERT, MAX_HW_OUTPUT, &args.tx)
                .await?;
        let (tx, signing_data) =
            build_shielded_transfer(&self.namada, &mut args, &mut bparams).await?;

        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_unshielding_transfer(
        &self,
        unshielding_transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let mut args =
            args::unshielding_transfer_tx_args(unshielding_transfer_msg, wrapper_tx_msg)?;
        let mut bparams =
            generate_masp_build_params(MAX_HW_SPEND, MAX_HW_CONVERT, MAX_HW_OUTPUT, &args.tx)
                .await?;

        let _ = &self
            .namada
            .wallet_mut()
            .await
            .insert_address(
                "asdasd",
                Address::from_str("tnam1q9k4a0a7cgprwdj8epn28kmv9s5ntu098c3ua875").unwrap(),
                false,
            )
            .unwrap();
        let _ = &self.namada.shielded_mut().await.load().await?;

        let (tx, signing_data) =
            build_unshielding_transfer(&self.namada, &mut args, &mut bparams).await?;

        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    //     pub async fn build_unshielding_transfer_pre(
    //         &self,
    //         unshielding_transfer_msg: &[u8],
    //         wrapper_tx_msg: &[u8],
    //     ) -> Result<JsValue, JsError> {
    //         let mut args =
    //             args::unshielding_transfer_tx_args(unshielding_transfer_msg, wrapper_tx_msg)?;

    //         web_sys::console::log_1(&"Building unshielding transfer".into());
    //         let signing_data = namada_sdk::tx_unshield::signing_data(&self.namada, &mut args).await?;

    //         web_sys::console::log_1(&"Signing data".into());

    //         let transfer_data = vec![];
    //         let data = namada_sdk::token::Transfer::default();
    //         web_sys::console::log_1(&"Transfer data 0".into());

    //         let (data, transfer_data) = namada_sdk::tx_unshield::add_transfer_data(
    //             &self.namada,
    //             &mut args,
    //             data,
    //             transfer_data,
    //         )
    //         .await?;
    //         web_sys::console::log_1(&"Transfer data".into());

    //         // Shielded fee payment
    //         let (fee_per_gas_unit, masp_fee_data) =
    //             namada_sdk::tx_unshield::fee_data(&self.namada, &mut args, &signing_data).await?;
    //         web_sys::console::log_1(&"Fee data".into());
    //         let data = namada_sdk::tx_unshield::add_fee_data(&masp_fee_data, data)?;
    //         web_sys::console::log_1(&"Fee data added".into());

    //         let asd = Part1Data(
    //             transfer_data,
    //             masp_fee_data,
    //             fee_per_gas_unit,
    //             data,
    //             signing_data,
    //         );

    //         to_js_result(borsh::to_vec(&asd)?)

    //         // let (tx, signing_data) = build_unshielding_transfer(&self.namada, &mut args).await?;
    //         // self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    //     }

    //     pub async fn build_unshielding_transfer_shielded_parts(
    //         &self,
    //         unshielding_transfer_msg: &[u8],
    //         wrapper_tx_msg: &[u8],
    //         part_1_data: &[u8],
    //     ) -> Result<JsValue, JsError> {
    //         let args = args::unshielding_transfer_tx_args(unshielding_transfer_msg, wrapper_tx_msg)?;
    //         web_sys::console::log_1(&format!("args: {:?}", args).into());
    //         let part_1_data = Part1Data::try_from_slice(part_1_data)?;
    //         let transfer_data = part_1_data.0;
    //         let masp_fee_data = part_1_data.1;

    //         // TODO: temp fix as construct_shielded_parts uses wallet to get tokens :|
    //         let _ = &self
    //             .namada
    //             .wallet_mut()
    //             .await
    //             .insert_address(
    //                 "asdasd",
    //                 Address::from_str("tnam1q9k4a0a7cgprwdj8epn28kmv9s5ntu098c3ua875").unwrap(),
    //                 false,
    //             )
    //             .unwrap();
    //         web_sys::console::log_1(&"Shielded parts1".into());
    //         let _ = &self.namada.shielded_mut().await.load().await?;

    //         let shielded_parts = namada_sdk::tx_unshield::construct_shielded_parts(
    //             &self.namada,
    //             transfer_data,
    //             masp_fee_data,
    //             !(args.tx.dry_run || args.tx.dry_run_wrapper),
    //             args.tx.expiration.to_datetime(),
    //         )
    //         .await?
    //         .expect("Shielding transfer must have shielded parts");

    //         web_sys::console::log_1(&"Shielded parts2".into());

    //         let shielded_parts = ShieldedParts(shielded_parts.0, shielded_parts.1);

    //         to_js_result(borsh::to_vec(&shielded_parts)?)
    //     }

    //     pub async fn build_unshielding_transfer_post(
    //         &self,
    //         unshielding_transfer_msg: &[u8],
    //         wrapper_tx_msg: &[u8],
    //         shielded_parts: &[u8],
    //         part_1_data: &[u8],
    //     ) -> Result<JsValue, JsError> {
    //         let args = args::unshielding_transfer_tx_args(unshielding_transfer_msg, wrapper_tx_msg)?;
    //         let part_1_data = Part1Data::try_from_slice(part_1_data)?;

    //         let shielded_parts = ShieldedParts::try_from_slice(shielded_parts)?;

    //         let add_shielded_parts =
    //             namada_sdk::tx_unshield::add_shielded_parts_fn((shielded_parts.0, shielded_parts.1));

    //         let data = part_1_data.3;

    //         let signing_data = part_1_data.4;

    //         let fee_per_gas_unit = part_1_data.2;

    //         let tx = namada_sdk::tx::build(
    //             &self.namada,
    //             &args.tx,
    //             args.tx_code_path.clone(),
    //             data,
    //             add_shielded_parts,
    //             fee_per_gas_unit,
    //             &signing_data.fee_payer
    //         )
    //         .await?;

    //         self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    //     }

    pub async fn build_shielding_transfer(
        &self,
        shielding_transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let mut args = args::shielding_transfer_tx_args(shielding_transfer_msg, wrapper_tx_msg)?;
        let mut bparams =
            generate_masp_build_params(MAX_HW_SPEND, MAX_HW_CONVERT, MAX_HW_OUTPUT, &args.tx)
                .await?;
        let (tx, signing_data, _masp_epoch) =
            build_shielding_transfer(&self.namada, &mut args, &mut bparams).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_ibc_transfer(
        &self,
        ibc_transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::ibc_transfer_tx_args(ibc_transfer_msg, wrapper_tx_msg)?;
        let mut bparams =
            generate_masp_build_params(MAX_HW_SPEND, MAX_HW_CONVERT, MAX_HW_OUTPUT, &args.tx)
                .await?;
        let (tx, signing_data, _) = build_ibc_transfer(&self.namada, &args, &mut bparams).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_eth_bridge_transfer(
        &self,
        eth_bridge_transfer_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::eth_bridge_transfer_tx_args(eth_bridge_transfer_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_bridge_pool_tx(&self.namada, args.clone()).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_vote_proposal(
        &self,
        vote_proposal_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::vote_proposal_tx_args(vote_proposal_msg, wrapper_tx_msg)?;
        let epoch = query_epoch(self.namada.client()).await?;
        let (tx, signing_data) = build_vote_proposal(&self.namada, &args, epoch)
            .await
            .map_err(JsError::from)?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_claim_rewards(
        &self,
        claim_rewards_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::claim_rewards_tx_args(claim_rewards_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_claim_rewards(&self.namada, &args)
            .await
            .map_err(JsError::from)?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_bond(
        &self,
        bond_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::bond_tx_args(bond_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_bond(&self.namada, &args).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_unbond(
        &self,
        unbond_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::unbond_tx_args(unbond_msg, wrapper_tx_msg)?;
        let (tx, signing_data, _) = build_unbond(&self.namada, &args).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_withdraw(
        &self,
        withdraw_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::withdraw_tx_args(withdraw_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_withdraw(&self.namada, &args).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_redelegate(
        &self,
        redelegate_msg: &[u8],
        wrapper_tx_msg: &[u8],
    ) -> Result<JsValue, JsError> {
        let args = args::redelegate_tx_args(redelegate_msg, wrapper_tx_msg)?;
        let (tx, signing_data) = build_redelegation(&self.namada, &args).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    pub async fn build_reveal_pk(&self, wrapper_tx_msg: &[u8]) -> Result<JsValue, JsError> {
        let args = args::tx_args_from_slice(wrapper_tx_msg)?;
        let public_key = args.signing_keys[0].clone();
        let (tx, signing_data) = build_reveal_pk(&self.namada, &args.clone(), &public_key).await?;
        self.serialize_tx_result(tx, wrapper_tx_msg, signing_data)
    }

    // Sign arbitrary data with the provided signing key
    pub fn sign_arbitrary(&self, signing_key: String, data: String) -> Result<JsValue, JsError> {
        let hash = Hash::sha256(data);
        let secret = common::SecretKey::Ed25519(ed25519::SecretKey::from_str(&signing_key)?);
        let signature = common::SigScheme::sign(&secret, hash);
        let sig_bytes = signature.to_bytes();

        to_js_result((hash.to_string().to_lowercase(), hex::encode(sig_bytes)))
    }

    // Verify signed arbitrary data
    pub fn verify_arbitrary(
        &self,
        public_key: String,
        signed_hash: String,
        signature: String,
    ) -> Result<(), JsError> {
        let public_key = common::PublicKey::from_str(&public_key)?;
        let sig = common::Signature::try_from_slice(&hex::decode(signature)?)?;
        let signed_hash = Hash::from_str(&signed_hash)?;

        common::SigScheme::verify_signature(&public_key, &signed_hash, &sig).map_err(JsError::from)
    }

    pub async fn generate_ibc_shielding_memo(
        &self,
        target: &str,
        token: String,
        amount: &str,
        channel_id: &str,
    ) -> Result<JsValue, JsError> {
        let ledger_address = Url::from_str(&self.rpc_url).expect("RPC URL is a valid URL");
        let target = TransferTarget::PaymentAddress(
            PaymentAddress::from_str(target).expect("target is a valid shielded address"),
        );
        let amount =
            InputAmount::Unvalidated(DenominatedAmount::from_str(amount).expect("amount is valid"));
        let channel_id = ChannelId::from_str(channel_id).expect("channel ID is valid");

        let args = GenIbcShieldingTransfer {
            query: Query { ledger_address },
            output_folder: None,
            target,
            token,
            amount,
            port_id: PortId::transfer(),
            channel_id,
            expiration: TxExpiration::Default,
        };

        if let Some(masp_tx) = gen_ibc_shielding_transfer(&self.namada, args).await? {
            let memo = convert_masp_tx_to_ibc_memo(&masp_tx);
            to_js_result(memo)
        } else {
            Err(JsError::new(
                "Generating ibc shielding transfer generated nothing",
            ))
        }
    }

    pub fn masp_address(&self) -> String {
        MASP.to_string()
    }

    fn serialize_tx_result(
        &self,
        tx: Tx,
        wrapper_tx_msg: &[u8],
        signing_data: SigningTxData,
    ) -> Result<JsValue, JsError> {
        let tx = tx::Tx::new(tx, wrapper_tx_msg, vec![signing_data])?;
        to_js_result(borsh::to_vec(&tx)?)
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "getMaspParams")]
    async fn get_masp_params() -> Result<JsValue, JsValue>;
    #[wasm_bindgen(catch, js_name = "hasMaspParams")]
    async fn has_masp_params() -> Result<JsValue, JsValue>;
    #[wasm_bindgen(catch, js_name = "fetchAndStoreMaspParams")]
    async fn fetch_and_store_masp_params(url: Option<String>) -> Result<JsValue, JsValue>;
}

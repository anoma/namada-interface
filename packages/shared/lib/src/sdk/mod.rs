use std::str::FromStr;

use crate::utils::to_js_result;
use crate::{
    rpc_client::HttpClient,
    sdk::masp::WebShieldedUtils,
    utils::{set_panic_hook, to_bytes},
};
use borsh::{BorshDeserialize, BorshSerialize};
use namada::ledger::signing::SigningTxData;
use namada::types::address::Address;
use namada::{
    ledger::{
        args,
        masp::ShieldedContext,
        signing,
        wallet::{Store, Wallet},
    },
    proto::Tx,
    types::key::common::PublicKey,
};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};

pub mod masp;
mod signature;
mod tx;
mod wallet;

#[wasm_bindgen]
#[derive(Copy, Clone, Debug)]
pub enum TxType {
    Bond = 1,
    Unbond = 2,
    Withdraw = 3,
    Transfer = 4,
    IBCTransfer = 5,
    EthBridgeTransfer = 6,
    RevealPK = 7,
}

/// Represents the Sdk public API.
#[wasm_bindgen]
pub struct Sdk {
    client: HttpClient,
    wallet: Wallet<wallet::BrowserWalletUtils>,
    shielded_ctx: ShieldedContext<masp::WebShieldedUtils>,
}

#[wasm_bindgen]
/// Sdk mostly wraps the logic of the Sdk struct members, making it a part of public API.
/// For more details, navigate to the corresponding modules.
impl Sdk {
    #[wasm_bindgen(constructor)]
    pub fn new(url: String) -> Self {
        set_panic_hook();
        Sdk {
            client: HttpClient::new(url),
            wallet: Wallet::new(wallet::STORAGE_PATH.to_owned(), Store::default()),
            shielded_ctx: ShieldedContext::default(),
        }
    }

    pub async fn has_masp_params() -> Result<JsValue, JsValue> {
        let has = has_masp_params().await?;

        Ok(js_sys::Boolean::from(has.as_bool().unwrap()).into())
    }

    pub async fn fetch_and_store_masp_params() -> Result<(), JsValue> {
        fetch_and_store_masp_params().await?;
        Ok(())
    }

    pub async fn load_masp_params(&mut self) -> Result<(), JsValue> {
        let params = get_masp_params().await?;
        let params_iter = js_sys::try_iter(&params)?.ok_or_else(|| "Can't iterate over JsValue")?;
        let mut params_bytes = params_iter.map(|p| to_bytes(p.unwrap()));

        let spend = params_bytes.next().unwrap();
        let output = params_bytes.next().unwrap();
        let convert = params_bytes.next().unwrap();

        // We are making sure that there are no more params left
        assert_eq!(params_bytes.next(), None);

        self.shielded_ctx = WebShieldedUtils::new(spend, output, convert);

        Ok(())
    }

    pub fn encode(&self) -> Vec<u8> {
        wallet::encode(&self.wallet)
    }

    pub fn decode(&mut self, data: Vec<u8>) -> Result<(), JsError> {
        let wallet = wallet::decode(data)?;
        self.wallet = wallet;
        Ok(())
    }

    pub fn clear_storage(&mut self) -> Result<(), JsError> {
        self.wallet = Wallet::new(wallet::STORAGE_PATH.to_owned(), Store::default());
        Ok(())
    }

    pub fn add_key(&mut self, private_key: &str, password: Option<String>, alias: Option<String>) {
        wallet::add_key(&mut self.wallet, private_key, password, alias)
    }

    pub fn add_spending_key(&mut self, xsk: &str, password: Option<String>, alias: &str) {
        wallet::add_spending_key(&mut self.wallet, xsk, password, alias)
    }

    /// Sign and submit transactions
    async fn sign_and_process_tx(
        &mut self,
        args: args::Tx,
        mut tx: Tx,
        signing_data: SigningTxData,
        is_faucet_transfer: bool,
    ) -> Result<(), JsError> {
        // We are revealing the signer of this transaction(if needed)
        // We only support one signer(for now)
        let pk = &signing_data
            .public_keys
            .clone()
            .into_iter()
            .nth(0)
            .expect("No public key provided");

        let address = Address::from(pk);

        if !is_faucet_transfer
            && namada::ledger::tx::is_reveal_pk_needed(&self.client, &address, false).await?
        {
            let (mut tx, _) = namada::ledger::tx::build_reveal_pk(
                &self.client,
                &mut self.wallet,
                &mut self.shielded_ctx,
                &args,
                &address,
                &pk,
                &signing_data.fee_payer,
            )
            .await?;

            signing::sign_tx(&mut self.wallet, &args, &mut tx, signing_data.clone())?;

            namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, tx).await?;
        }

        // Sign tx
        signing::sign_tx(&mut self.wallet, &args, &mut tx, signing_data.clone())?;

        // Submit tx
        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, tx).await?;

        Ok(())
    }

    /// Submit signed reveal pk tx
    pub async fn submit_signed_reveal_pk(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        sig_msg_bytes: &[u8],
    ) -> Result<(), JsError> {
        let reveal_pk_tx = self.sign_tx(tx_bytes, sig_msg_bytes)?;
        let args = tx::tx_args_from_slice(&tx_msg)?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, reveal_pk_tx).await?;

        Ok(())
    }

    /// Build transaction for specified type, return bytes to client
    pub async fn build_tx(
        &mut self,
        tx_type: TxType,
        tx_msg: &[u8],
        gas_payer: String,
    ) -> Result<JsValue, JsError> {
        //TODO: verify if this works
        // We prefix 00 because PublicKey is an enum. TODO: fix when ledger is updated to handle
        // payment addresses
        let gas_payer = PublicKey::from_str(&format!("00{}", gas_payer))?;

        let tx = match tx_type {
            TxType::Bond => {
                let (args, _) = tx::bond_tx_args(tx_msg, None)?;
                let (bond, _) = namada::ledger::tx::build_bond(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await
                .map_err(JsError::from)?;
                bond
            }
            TxType::RevealPK => {
                let args = tx::tx_args_from_slice(tx_msg)?;

                let public_key = match args.verification_key.clone() {
                    Some(v) => PublicKey::from(v),
                    _ => {
                        return Err(JsError::new(
                            "verification_key is required in this context!",
                        ))
                    }
                };

                let address = Address::from(&public_key);

                let (reveal_pk, _) = namada::ledger::tx::build_reveal_pk(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    &args.clone(),
                    &address,
                    &public_key,
                    &gas_payer,
                )
                .await?;
                reveal_pk
            }
            TxType::Transfer => {
                let (args, _faucet_signer) = tx::transfer_tx_args(tx_msg, None, None)?;
                let (tx, _) = namada::ledger::tx::build_transfer(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await?;
                tx
            }
            TxType::IBCTransfer => {
                let (args, _faucet_signer) = tx::ibc_transfer_tx_args(tx_msg, None)?;

                let (tx, _) = namada::ledger::tx::build_ibc_transfer(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await?;
                tx
            }
            TxType::EthBridgeTransfer => {
                let (args, _faucet_signer) = tx::eth_bridge_transfer_tx_args(tx_msg, None)?;

                let (tx, _) = namada::ledger::eth_bridge::bridge_pool::build_bridge_pool_tx(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await?;
                tx
            }
            TxType::Unbond => {
                let (args, _faucet_signer) = tx::unbond_tx_args(tx_msg, None)?;
                let (tx, _, _) = namada::ledger::tx::build_unbond(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await?;
                tx
            }
            TxType::Withdraw => {
                let (args, _faucet_signer) = tx::withdraw_tx_args(tx_msg, None)?;
                let (withdraw, _) = namada::ledger::tx::build_withdraw(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                    gas_payer,
                )
                .await?;
                withdraw
            }
        };

        to_js_result(tx.try_to_vec()?)
    }

    // Append signatures and return tx bytes
    fn sign_tx(&self, tx_bytes: &[u8], sig_msg_bytes: &[u8]) -> Result<Tx, JsError> {
        let mut tx: Tx = Tx::try_from_slice(tx_bytes)?;
        let signature::SignatureMsg {
            pubkey,
            raw_indices,
            raw_signature,
            wrapper_indices,
            wrapper_signature,
        } = signature::SignatureMsg::try_from_slice(&sig_msg_bytes)?;

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

        Ok(tx)
    }

    /// Submit signed tx
    pub async fn submit_signed_tx(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        sig_msg_bytes: &[u8],
    ) -> Result<(), JsError> {
        let transfer_tx = self.sign_tx(tx_bytes, sig_msg_bytes)?;
        let args = tx::tx_args_from_slice(tx_msg)?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, transfer_tx).await?;

        Ok(())
    }

    pub async fn submit_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
        xsk: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::transfer_tx_args(tx_msg, password, xsk)?;
        let effective_address = args.source.effective_address();
        let default_signer = faucet_signer.clone().or(Some(effective_address.clone()));

        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            Some(effective_address.clone()),
            default_signer,
        )
        .await?;

        let (tx, _) = namada::ledger::tx::build_transfer(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }

    pub async fn submit_ibc_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::ibc_transfer_tx_args(tx_msg, password)?;
        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(Some(source.clone()));

        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            Some(source.clone()),
            default_signer,
        )
        .await?;

        let (tx, _) = namada::ledger::tx::build_ibc_transfer(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }

    pub async fn submit_eth_bridge_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::eth_bridge_transfer_tx_args(tx_msg, password)?;
        let sender = args.sender.clone();
        let default_signer = faucet_signer.clone().or(Some(sender.clone()));

        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            Some(sender.clone()),
            default_signer,
        )
        .await?;

        let (tx, _) = namada::ledger::eth_bridge::bridge_pool::build_bridge_pool_tx(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }

    pub async fn submit_bond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::bond_tx_args(tx_msg, password)?;
        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());

        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            source,
            default_signer,
        )
        .await?;

        let (tx, _) = namada::ledger::tx::build_bond(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }

    /// Submit unbond
    pub async fn submit_unbond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::unbond_tx_args(tx_msg, password)?;
        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());
        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            source,
            default_signer,
        )
        .await?;

        let (tx, _, _) = namada::ledger::tx::build_unbond(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }

    pub async fn submit_withdraw(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let (args, faucet_signer) = tx::withdraw_tx_args(tx_msg, password)?;
        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());
        let signing_data = signing::aux_signing_data(
            &self.client,
            &mut self.wallet,
            &args.tx.clone(),
            source,
            default_signer,
        )
        .await?;

        let (tx, _) = namada::ledger::tx::build_withdraw(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            signing_data.fee_payer.clone(),
        )
        .await?;

        self.sign_and_process_tx(args.tx, tx, signing_data, faucet_signer.is_some())
            .await?;

        Ok(())
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "getMaspParams")]
    async fn get_masp_params() -> Result<JsValue, JsValue>;
    #[wasm_bindgen(catch, js_name = "hasMaspParams")]
    async fn has_masp_params() -> Result<JsValue, JsValue>;
    #[wasm_bindgen(catch, js_name = "fetchAndStoreMaspParams")]
    async fn fetch_and_store_masp_params() -> Result<JsValue, JsValue>;
}

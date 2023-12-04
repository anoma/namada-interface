use std::str::FromStr;

use crate::rpc_client::HttpClient;
use crate::utils::to_js_result;
use crate::{
    sdk::masp::WebShieldedUtils,
    utils::{set_panic_hook, to_bytes},
};
use borsh::BorshDeserialize;
use namada::ledger::{eth_bridge::bridge_pool::build_bridge_pool_tx, pos::common::SecretKey};
use namada::namada_sdk::masp::ShieldedContext;
use namada::namada_sdk::rpc::query_epoch;
use namada::namada_sdk::signing::{default_sign, sign_tx, SigningTxData};
use namada::namada_sdk::tx::{
    build_bond, build_ibc_transfer, build_reveal_pk, build_transfer, build_unbond,
    build_vote_proposal, build_withdraw, is_reveal_pk_needed, process_tx,
};

use self::io::WebIo;
use self::wallet::BrowserWalletUtils;
use namada::namada_sdk::wallet::{Store, Wallet};
use namada::namada_sdk::{Namada, NamadaImpl};
use namada::types::address::Address;
use namada::{proto::Tx, types::key::common::PublicKey};
use wasm_bindgen::{prelude::wasm_bindgen, JsError, JsValue};
pub mod io;
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
    VoteProposal = 8,
}

#[wasm_bindgen]
pub struct BuiltTx {
    tx: Tx,
    signing_data: SigningTxData,
}

#[wasm_bindgen]
impl BuiltTx {
    pub fn tx_bytes(&self) -> Result<Vec<u8>, JsError> {
        Ok(borsh::to_vec(&self.tx)?)
    }
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
            wallet: Wallet::new(BrowserWalletUtils {}, Store::default()),
            shielded_ctx: ShieldedContext::default(),
        }
    }

    fn get_namada(&mut self) -> impl Namada {
        NamadaImpl::native_new(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            &WebIo,
            //NAM address
            Address::from_str("tnam1q99c37u38grkdcc2qze0hz4zjjd8zr3yucd3mzgz").unwrap(),
        )
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
        self.wallet = Wallet::new(BrowserWalletUtils {}, Store::default());
        Ok(())
    }

    pub fn add_key(&mut self, private_key: &str, password: Option<String>, alias: Option<String>) {
        wallet::add_key(&mut self.wallet, private_key, password, alias)
    }

    pub fn add_spending_key(&mut self, xsk: &str, password: Option<String>, alias: &str) {
        wallet::add_spending_key(&mut self.wallet, xsk, password, alias)
    }

    pub async fn sign_tx(
        &mut self,
        built_tx: BuiltTx,
        tx_msg: &[u8],
        secret: String,
    ) -> Result<JsValue, JsError> {
        let BuiltTx {
            mut tx,
            signing_data,
        } = built_tx;

        let mut args = tx::tx_args_from_slice(tx_msg)?;

        // Append signing key to args, appending prefix to support encoding
        let signing_key = SecretKey::from_str(&format!("{}{}", "00", secret))?;
        args.signing_keys = vec![signing_key];

        // We only support one signer(for now)
        let pk = &signing_data
            .public_keys
            .clone()
            .into_iter()
            .nth(0)
            .expect("No public key provided");

        // TODO: this is a workaround so it is possible to sign reveal_pk tx
        // ideally we want to always pass the verification_key/signing keys in the tx_msg
        let vk = match args.verification_key {
            Some(vk) => vk,
            None => pk.clone(),
        };
        args.verification_key = Some(vk);

        let address = Address::from(pk);
        let namada = self.get_namada();

        let reveal_pk_tx_bytes = if is_reveal_pk_needed(namada.client(), &address, false).await? {
            let (mut tx, _, _) = build_reveal_pk(&namada, &args, &pk).await?;
            sign_tx(&namada, &args, &mut tx, signing_data.clone(), default_sign).await?;

            borsh::to_vec(&tx)?
        } else {
            vec![]
        };

        // Sign tx
        sign_tx(&namada, &args, &mut tx, signing_data.clone(), default_sign).await?;

        to_js_result((borsh::to_vec(&tx)?, reveal_pk_tx_bytes))
    }

    pub async fn process_tx(
        &mut self,
        tx_bytes: &[u8],
        tx_msg: &[u8],
        reveal_pk_tx_bytes: &[u8],
    ) -> Result<(), JsError> {
        let args = tx::tx_args_from_slice(tx_msg)?;
        let namada = self.get_namada();

        if reveal_pk_tx_bytes.is_empty() == false {
            let reveal_pk_tx = Tx::try_from_slice(reveal_pk_tx_bytes)?;
            process_tx(&namada, &args, reveal_pk_tx).await?;
        }

        let tx = Tx::try_from_slice(tx_bytes)?;
        process_tx(&namada, &args, tx).await?;

        Ok(())
    }

    /// Build transaction for specified type, return bytes to client
    pub async fn build_tx(
        &mut self,
        tx_type: TxType,
        specific_msg: &[u8],
        tx_msg: &[u8],
        gas_payer: String,
    ) -> Result<JsValue, JsError> {
        let tx = match tx_type {
            TxType::Bond => {
                self.build_bond(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::Unbond => {
                self.build_unbond(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::Withdraw => {
                self.build_withdraw(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::Transfer => {
                self.build_transfer(specific_msg, tx_msg, None, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::IBCTransfer => {
                self.build_ibc_transfer(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::EthBridgeTransfer => {
                self.build_eth_bridge_transfer(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
            TxType::RevealPK => self.build_reveal_pk(tx_msg, gas_payer).await?,
            TxType::VoteProposal => {
                self.build_vote_proposal(specific_msg, tx_msg, None, Some(gas_payer))
                    .await?
                    .tx
            }
        };

        to_js_result(borsh::to_vec(&tx)?)
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

        to_js_result(borsh::to_vec(&tx)?)
    }

    pub async fn build_transfer(
        &mut self,
        transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        xsk: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let mut args = tx::transfer_tx_args(transfer_msg, tx_msg, password, xsk)?;

        let namada = self.get_namada();
        let (tx, signing_data, _) = build_transfer(&namada, &mut args).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_ibc_transfer(
        &mut self,
        ibc_transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::ibc_transfer_tx_args(ibc_transfer_msg, tx_msg, password)?;

        let namada = self.get_namada();
        let (tx, signing_data, _) = build_ibc_transfer(&namada, &args).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_eth_bridge_transfer(
        &mut self,
        eth_bridge_transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::eth_bridge_transfer_tx_args(eth_bridge_transfer_msg, tx_msg, password)?;

        let namada = self.get_namada();
        let (tx, signing_data, _) = build_bridge_pool_tx(&namada, args.clone()).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_vote_proposal(
        &mut self,
        vote_proposal_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::vote_proposal_tx_args(vote_proposal_msg, tx_msg, password)?;
        let epoch = query_epoch(&self.client).await?;
        let namada = self.get_namada();

        let (tx, signing_data, _) = build_vote_proposal(&namada, &args, epoch)
            .await
            .map_err(JsError::from)?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_bond(
        &mut self,
        bond_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::bond_tx_args(bond_msg, tx_msg, password)?;

        let namada = self.get_namada();
        let (tx, signing_data, _) = build_bond(&namada, &args).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_unbond(
        &mut self,
        unbond_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::unbond_tx_args(unbond_msg, tx_msg, password)?;

        let namada = self.get_namada();
        let (tx, signing_data, _, _) = build_unbond(&namada, &args).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    pub async fn build_withdraw(
        &mut self,
        withdraw_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        _gas_payer: Option<String>,
    ) -> Result<BuiltTx, JsError> {
        let args = tx::withdraw_tx_args(withdraw_msg, tx_msg, password)?;

        let namada = self.get_namada();
        let (tx, signing_data, _) = build_withdraw(&namada, &args).await?;

        Ok(BuiltTx { tx, signing_data })
    }

    async fn build_reveal_pk(&mut self, tx_msg: &[u8], _gas_payer: String) -> Result<Tx, JsError> {
        let args = tx::tx_args_from_slice(tx_msg)?;

        let public_key = match args.verification_key.clone() {
            Some(v) => PublicKey::from(v),
            _ => {
                return Err(JsError::new(
                    "verification_key is required in this context!",
                ))
            }
        };

        let namada = self.get_namada();

        let (reveal_pk, _, _) = build_reveal_pk(&namada, &args.clone(), &public_key).await?;

        Ok(reveal_pk)
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

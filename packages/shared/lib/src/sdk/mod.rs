use crate::utils::to_js_result;
use crate::{
    rpc_client::HttpClient,
    sdk::masp::WebShieldedUtils,
    utils::{set_panic_hook, to_bytes},
};
use borsh::{BorshDeserialize, BorshSerialize};
use namada::{
    ledger::{
        args,
        masp::ShieldedContext,
        signing,
        wallet::{Store, Wallet},
    },
    proto::{Section, Tx},
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
    Bond = 0,
    Unbond = 1,
    Withdraw = 2,
    Transfer = 3,
    RevealPK = 4,
}

// Require that a public key is present
fn validate_pk(pk: Option<PublicKey>) -> Result<PublicKey, JsError> {
    match pk {
        Some(v) => Ok(v),
        None => Err(JsError::new("No public key was provided!")),
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

    async fn submit_reveal_pk(
        &mut self,
        args: &args::Tx,
        mut tx: Tx,
        pk: &PublicKey,
    ) -> Result<(), JsError> {
        // Build a transaction to reveal the signer of this transaction
        let reveal_pk = namada::ledger::tx::build_reveal_pk(
            &self.client,
            &mut self.wallet,
            args::RevealPk {
                tx: args.clone(),
                public_key: pk.clone(),
            },
        )
        .await?;

        // Sign and submit reveal pk
        if let Some((mut rtx, _, _)) = reveal_pk {
            // Sign the reveal public key transaction with the fee payer
            signing::sign_tx(&mut self.wallet, &mut rtx, &args, &pk).await?;
            // Submit the reveal public key transaction first
            namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, rtx).await?;
            // Update the stateful PoW challenge of the outer transaction
            #[cfg(not(feature = "mainnet"))]
            signing::update_pow_challenge(&self.client, &args, &mut tx, &pk, false).await;
        }

        Ok(())
    }

    /// Sign and submit transactions
    async fn sign_and_process_tx(
        &mut self,
        args: args::Tx,
        mut tx: Tx,
        pk: PublicKey,
    ) -> Result<(), JsError> {
        // Submit a reveal pk tx if necessary
        self.submit_reveal_pk(&args, tx.clone(), &pk).await?;

        // Sign tx
        signing::sign_tx(&mut self.wallet, &mut tx, &args, &pk)
            .await
            .map_err(JsError::from)?;

        // Submit tx
        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    /// Submit signed reveal pk tx
    pub async fn submit_signed_reveal_pk(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<(), JsError> {
        let reveal_pk_tx = self.sign_tx(tx_bytes, raw_sig_bytes, wrapper_sig_bytes)?;
        let args = tx::tx_args_from_slice(&tx_msg).map_err(JsError::from)?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, reveal_pk_tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    /// Build transaction for specified type, return bytes to client
    pub async fn build_tx(&mut self, tx_type: TxType, tx_msg: &[u8]) -> Result<JsValue, JsError> {
        let tx = match tx_type {
            TxType::Bond => {
                let args = tx::bond_tx_args(tx_msg, None)?;
                let bond =
                    namada::ledger::tx::build_bond(&self.client, &mut self.wallet, args.clone())
                        .await
                        .map_err(JsError::from)?;
                bond.0
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

                let reveal_pk = namada::ledger::tx::build_reveal_pk(
                    &self.client,
                    &mut self.wallet,
                    args::RevealPk {
                        tx: args.clone(),
                        public_key,
                    },
                )
                .await?;

                match reveal_pk {
                    Some(v) => v.0,
                    None => {
                        return Err(JsError::new(
                            "Attempted to build reveal pk for existing public key!",
                        ))
                    }
                }
            }
            TxType::Transfer => {
                let args = tx::transfer_tx_args(tx_msg, None, None)?;
                let transfer = namada::ledger::tx::build_transfer(
                    &self.client,
                    &mut self.wallet,
                    &mut self.shielded_ctx,
                    args.clone(),
                )
                .await
                .map_err(JsError::from)?;
                transfer.0
            }
            TxType::Unbond => {
                let args = tx::unbond_tx_args(tx_msg, None)?;
                let unbond =
                    namada::ledger::tx::build_unbond(&self.client, &mut self.wallet, args.clone())
                        .await
                        .map_err(JsError::from)?;
                unbond.0
            }
            _ => {
                return Err(JsError::new(&format!(
                    "TxType \"{:?}\" not implemented!",
                    tx_type,
                )))
            }
        };

        to_js_result(tx.try_to_vec().map_err(JsError::from)?)
    }

    // Append signatures and return tx bytes
    fn sign_tx(
        &self,
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<Tx, JsError> {
        let mut tx: Tx = Tx::try_from_slice(tx_bytes).map_err(JsError::from)?;

        let raw_sig = signature::construct_signature(raw_sig_bytes, &tx)?;
        tx.add_section(Section::Signature(raw_sig));

        let wrapper_sig = signature::construct_signature(wrapper_sig_bytes, &tx)?;
        tx.add_section(Section::Signature(wrapper_sig));

        tx.protocol_filter();

        Ok(tx)
    }

    /// Submit signed transfer tx
    pub async fn submit_signed_transfer(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<(), JsError> {
        let transfer_tx = self.sign_tx(tx_bytes, raw_sig_bytes, wrapper_sig_bytes)?;
        let args = tx::transfer_tx_args(tx_msg, None, None).map_err(JsError::from)?;
        let verification_key = args.tx.verification_key.clone();
        let pk = validate_pk(verification_key)?;

        self.submit_reveal_pk(&args.tx, transfer_tx.clone(), &pk)
            .await?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args.tx, transfer_tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    /// Submit signed tx
    pub async fn submit_signed_tx(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<(), JsError> {
        let transfer_tx = self.sign_tx(tx_bytes, raw_sig_bytes, wrapper_sig_bytes)?;
        let args = tx::tx_args_from_slice(tx_msg)?;
        let verification_key = args.verification_key.clone();
        let pk = validate_pk(verification_key)?;

        self.submit_reveal_pk(&args, transfer_tx.clone(), &pk)
            .await?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args, transfer_tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    pub async fn submit_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
        xsk: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::transfer_tx_args(tx_msg, password, xsk)?;
        let (tx, _, pk, _, _) = namada::ledger::tx::build_transfer(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
        )
        .await
        .map_err(JsError::from)?;

        self.sign_and_process_tx(args.tx, tx, pk).await?;

        Ok(())
    }

    pub async fn submit_ibc_transfer(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::ibc_transfer_tx_args(tx_msg, password)?;

        let (tx, _, pk) =
            namada::ledger::tx::build_ibc_transfer(&self.client, &mut self.wallet, args.clone())
                .await
                .map_err(JsError::from)?;

        self.sign_and_process_tx(args.tx, tx, pk).await?;

        Ok(())
    }

    pub async fn submit_bond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::bond_tx_args(tx_msg, password)?;

        let (tx, _, pk) =
            namada::ledger::tx::build_bond(&mut self.client, &mut self.wallet, args.clone())
                .await
                .map_err(JsError::from)?;

        self.sign_and_process_tx(args.tx, tx, pk).await?;

        Ok(())
    }

    /// Submit signed bond
    pub async fn submit_signed_bond(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<(), JsError> {
        let bond_tx = self.sign_tx(tx_bytes, raw_sig_bytes, wrapper_sig_bytes)?;
        let args = tx::bond_tx_args(tx_msg, None).map_err(JsError::from)?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args.tx, bond_tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    /// Submit unbond
    pub async fn submit_unbond(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::unbond_tx_args(tx_msg, password)?;

        let (tx, _, pk, _) =
            namada::ledger::tx::build_unbond(&mut self.client, &mut self.wallet, args.clone())
                .await
                .map_err(JsError::from)?;

        self.sign_and_process_tx(args.tx, tx, pk).await?;

        Ok(())
    }

    /// Submit signed unbond tx
    pub async fn submit_signed_unbond(
        &mut self,
        tx_msg: &[u8],
        tx_bytes: &[u8],
        raw_sig_bytes: &[u8],
        wrapper_sig_bytes: &[u8],
    ) -> Result<(), JsError> {
        let bond_tx = self.sign_tx(tx_bytes, raw_sig_bytes, wrapper_sig_bytes)?;
        let args = tx::unbond_tx_args(tx_msg, None).map_err(JsError::from)?;
        let verification_key = args.tx.verification_key.clone();
        let pk = validate_pk(verification_key)?;

        self.submit_reveal_pk(&args.tx, bond_tx.clone(), &pk)
            .await?;

        namada::ledger::tx::process_tx(&self.client, &mut self.wallet, &args.tx, bond_tx)
            .await
            .map_err(JsError::from)?;

        Ok(())
    }

    pub async fn submit_withdraw(
        &mut self,
        tx_msg: &[u8],
        password: Option<String>,
    ) -> Result<(), JsError> {
        let args = tx::withdraw_tx_args(tx_msg, password)?;

        let (tx, _, pk) =
            namada::ledger::tx::build_withdraw(&mut self.client, &mut self.wallet, args.clone())
                .await
                .map_err(JsError::from)?;

        self.sign_and_process_tx(args.tx, tx, pk).await?;

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

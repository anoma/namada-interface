use std::str::FromStr;

use crate::sdk::io::WebIo;
use crate::utils::to_js_result;
use crate::{
    rpc_client::HttpClient,
    sdk::masp::WebShieldedUtils,
    utils::{set_panic_hook, to_bytes},
};
use borsh::{BorshDeserialize, BorshSerialize};
use namada::ledger::eth_bridge::bridge_pool::build_bridge_pool_tx;
use namada::sdk::args;
use namada::sdk::masp::ShieldedContext;
use namada::sdk::signing::{aux_signing_data, sign_tx, SigningTxData};
use namada::sdk::tx::{
    build_bond, build_ibc_transfer, build_reveal_pk, build_transfer, build_unbond, build_withdraw,
    is_reveal_pk_needed, process_tx,
};
use namada::sdk::wallet::{Store, Wallet};
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
}

#[wasm_bindgen]
pub struct BuiltTx {
    tx: Tx,
    signing_data: SigningTxData,
    is_faucet_transfer: bool
}

#[wasm_bindgen]
impl BuiltTx {
    pub fn tx_bytes(&self) -> Result<Vec<u8>, JsError> {
        Ok(self.tx.try_to_vec()?)
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

    pub async fn sign_tx(
        &mut self,
        built_tx: BuiltTx,
        tx_msg: &[u8]
    ) -> Result<JsValue, JsError> {
        let BuiltTx {
            mut tx,
            signing_data,
            is_faucet_transfer
        } = built_tx;

        let args = tx::tx_args_from_slice(tx_msg)?;

        // We are revealing the signer of this transaction(if needed)
        // We only support one signer(for now)
        let pk = &signing_data
            .public_keys
            .clone()
            .into_iter()
            .nth(0)
            .expect("No public key provided");

        let address = Address::from(pk);

        let reveal_pk_tx_bytes = if !is_faucet_transfer && is_reveal_pk_needed(&self.client, &address, false).await? {
            let (mut tx, _) = build_reveal_pk::<_, _, _, WebIo>(
                &self.client,
                &mut self.wallet,
                &mut self.shielded_ctx,
                &args,
                &address,
                &pk,
                &signing_data.fee_payer,
            )
            .await?;

            sign_tx(&mut self.wallet, &args, &mut tx, signing_data.clone())?;

            let bytes = tx.try_to_vec()?;

            Some(bytes)
        } else {
            None
        };

        // Sign tx
        sign_tx(&mut self.wallet, &args, &mut tx, signing_data.clone())?;

        to_js_result((tx.try_to_vec()?, reveal_pk_tx_bytes))
    }

    pub async fn process_tx(
        &mut self,
        tx_bytes: &[u8],
        tx_msg: &[u8],
        reveal_pk_tx_bytes: Option<Vec<u8>>
    ) -> Result<(), JsError> {
        let args = tx::tx_args_from_slice(tx_msg)?;

        if let Some(bytes) = reveal_pk_tx_bytes {
            let reveal_pk_tx = Tx::try_from_slice(bytes.as_slice())?;
            process_tx::<_, _, WebIo>(&self.client, &mut self.wallet, &args, reveal_pk_tx).await?;
        }

        let tx = Tx::try_from_slice(tx_bytes)?;
        process_tx::<_, _, WebIo>(&self.client, &mut self.wallet, &args, tx).await?;

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
            TxType::Bond =>
                self.build_bond(specific_msg, tx_msg, None, Some(gas_payer)).await?.tx,
            TxType::Unbond =>
                self.build_unbond(specific_msg, tx_msg, None, Some(gas_payer)).await?.tx,
            TxType::Withdraw =>
                self.build_withdraw(specific_msg, tx_msg, None, Some(gas_payer)).await?.tx,
            TxType::Transfer =>
                self.build_transfer(specific_msg, tx_msg, None, None, Some(gas_payer)).await?.tx,
            TxType::IBCTransfer =>
                self.build_ibc_transfer(specific_msg, tx_msg, None, Some(gas_payer)).await?.tx,
            TxType::EthBridgeTransfer =>
                self.build_eth_bridge_transfer(specific_msg, tx_msg, None, Some(gas_payer)).await?.tx,
            TxType::RevealPK =>
                self.build_reveal_pk(tx_msg, gas_payer).await?,
        };

        to_js_result(tx.try_to_vec()?)
    }

    // Append signatures and return tx bytes
    pub fn append_signature(&self, tx_bytes: &[u8], sig_msg_bytes: &[u8]) -> Result<JsValue, JsError> {
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

        to_js_result(tx.try_to_vec()?)
    }

    async fn signing_data_and_fee_payer(
        &mut self,
        args: &args::Tx,
        owner: Option<Address>,
        default_signer: Option<Address>,
        gas_payer: Option<String>
    ) -> Result<(SigningTxData, PublicKey), JsError> {
        let signing_data = aux_signing_data::<_, _, WebIo>(
            &self.client,
            &mut self.wallet,
            args,
            owner,
            default_signer,
        )
        .await?;

        let fee_payer = match gas_payer {
            Some(gas_payer) =>
                //TODO: verify if this works
                // We prefix 00 because PublicKey is an enum.
                // TODO: fix when ledger is updated to handle payment addresses
                PublicKey::from_str(&format!("00{}", gas_payer))?,
            None =>
                signing_data.fee_payer.clone()
        };

        Ok((signing_data, fee_payer))
    }

    pub async fn build_transfer(
        &mut self,
        transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        xsk: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::transfer_tx_args(transfer_msg, tx_msg, password, xsk)?;

        let effective_address = args.source.effective_address();
        let default_signer = faucet_signer.clone().or(Some(effective_address.clone()));

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            Some(effective_address.clone()),
            default_signer,
            gas_payer
        ).await?;

        let (tx, _) = build_transfer::<_, _, _, WebIo>(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            fee_payer,
        )
        .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    pub async fn build_ibc_transfer(
        &mut self,
        ibc_transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::ibc_transfer_tx_args(ibc_transfer_msg, tx_msg, password)?;

        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(Some(source.clone()));

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            Some(source),
            default_signer,
            gas_payer
        ).await?;

        let (tx, _) = build_ibc_transfer::<_, _, _, WebIo>(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            fee_payer
        )
        .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    pub async fn build_eth_bridge_transfer(
        &mut self,
        eth_bridge_transfer_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::eth_bridge_transfer_tx_args(eth_bridge_transfer_msg, tx_msg, password)?;

        let sender = args.sender.clone();
        let default_signer = faucet_signer.clone().or(Some(sender.clone()));

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            Some(sender),
            default_signer,
            gas_payer
        ).await?;

        let (tx, _) =
            build_bridge_pool_tx::<_, _, _, WebIo>(
                &self.client,
                &mut self.wallet,
                &mut self.shielded_ctx,
                args.clone(),
                fee_payer,
            )
            .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    pub async fn build_bond(
        &mut self,
        bond_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::bond_tx_args(bond_msg, tx_msg, password)?;

        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            source,
            default_signer,
            gas_payer
        ).await?;

        let (tx, _) = build_bond::<_, _, _, WebIo>(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            fee_payer,
        )
        .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    pub async fn build_unbond(
        &mut self,
        unbond_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::unbond_tx_args(unbond_msg, tx_msg, password)?;

        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            source,
            default_signer,
            gas_payer
        ).await?;

        let (tx, _, _) = build_unbond::<_, _, _, WebIo>(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            fee_payer,
        )
        .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    pub async fn build_withdraw(
        &mut self,
        withdraw_msg: &[u8],
        tx_msg: &[u8],
        password: Option<String>,
        gas_payer: Option<String>
    ) -> Result<BuiltTx, JsError> {
        let (args, faucet_signer) =
            tx::withdraw_tx_args(withdraw_msg, tx_msg, password)?;

        let source = args.source.clone();
        let default_signer = faucet_signer.clone().or(source.clone());

        let (signing_data, fee_payer) = self.signing_data_and_fee_payer(
            &args.tx,
            source,
            default_signer,
            gas_payer
        ).await?;

        let (tx, _) = build_withdraw::<_, _, _, WebIo>(
            &mut self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            args.clone(),
            fee_payer,
        )
        .await?;

        Ok(BuiltTx {
            tx,
            signing_data,
            is_faucet_transfer: faucet_signer.is_some()
        })
    }

    async fn build_reveal_pk(
        &mut self,
        tx_msg: &[u8],
        gas_payer: String,
    ) -> Result<Tx, JsError> {
         //TODO: verify if this works
         // We prefix 00 because PublicKey is an enum.
         // TODO: fix when ledger is updated to handle payment addresses
        let gas_payer = PublicKey::from_str(&format!("00{}", gas_payer))?;

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

        let (reveal_pk, _) = build_reveal_pk::<_, _, _, WebIo>(
            &self.client,
            &mut self.wallet,
            &mut self.shielded_ctx,
            &args.clone(),
            &address,
            &public_key,
            &gas_payer,
        )
        .await?;

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

use async_trait::async_trait;
use gloo_utils::format::JsValueSerdeExt;
use masp_proofs::prover::LocalTxProver;
use namada::core::borsh::{BorshDeserialize, BorshSerialize};
use namada::sdk::masp::{ShieldedContext, ShieldedUtils};
use rexie::{Error, ObjectStore, Rexie, TransactionMode};
use wasm_bindgen::JsValue;

use crate::utils::to_bytes;

const DB_PREFIX: &str = "Namada::MASP";
const SHIELDED_CONTEXT_TABLE: &str = "ShieldedContext";
const SHIELDED_CONTEXT_KEY: &str = "shielded-context";

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
#[borsh(crate = "namada::core::borsh")]
pub struct WebShieldedUtils {
    spend_param_bytes: Vec<u8>,
    output_param_bytes: Vec<u8>,
    convert_param_bytes: Vec<u8>,
}

impl WebShieldedUtils {
    pub fn new(
        spend_param_bytes: Vec<u8>,
        output_param_bytes: Vec<u8>,
        convert_param_bytes: Vec<u8>,
    ) -> ShieldedContext<Self> {
        let utils = Self {
            spend_param_bytes,
            output_param_bytes,
            convert_param_bytes,
        };

        ShieldedContext {
            utils,
            ..Default::default()
        }
    }

    fn to_io_err(e: Error) -> std::io::Error {
        std::io::Error::new(std::io::ErrorKind::Other, e.to_string())
    }

    pub async fn build_database() -> Result<Rexie, Error> {
        let rexie = Rexie::builder(DB_PREFIX)
            .version(1)
            .add_object_store(ObjectStore::new(SHIELDED_CONTEXT_TABLE))
            .build()
            .await?;

        Ok(rexie)
    }

    pub async fn set_context(rexie: &Rexie, context: JsValue) -> Result<(), Error> {
        //TODO: add readwriteflush
        let transaction =
            rexie.transaction(&[SHIELDED_CONTEXT_TABLE], TransactionMode::ReadWrite)?;

        let context_store = transaction.store(SHIELDED_CONTEXT_TABLE)?;

        context_store
            .put(&context, Some(&JsValue::from_str(SHIELDED_CONTEXT_KEY)))
            .await?;

        Ok(())
    }

    async fn get_context(rexie: &Rexie) -> Result<JsValue, Error> {
        let transaction =
            rexie.transaction(&[SHIELDED_CONTEXT_TABLE], TransactionMode::ReadOnly)?;

        let context_store = transaction.store(SHIELDED_CONTEXT_TABLE)?;

        let context = context_store
            .get(&JsValue::from_str(SHIELDED_CONTEXT_KEY))
            .await?;

        Ok(context)
    }
}

#[async_trait(?Send)]
impl ShieldedUtils for WebShieldedUtils {
    fn local_tx_prover(&self) -> LocalTxProver {
        LocalTxProver::from_bytes(
            &self.spend_param_bytes,
            &self.output_param_bytes,
            &self.convert_param_bytes,
        )
    }

    async fn load<U: ShieldedUtils>(&self, ctx: &mut ShieldedContext<U>) -> std::io::Result<()> {
        let db = Self::build_database().await.map_err(Self::to_io_err)?;
        let stored_ctx = Self::get_context(&db).await.map_err(Self::to_io_err)?;
        let stored_ctx_bytes = to_bytes(stored_ctx);

        *ctx = ShieldedContext {
            utils: ctx.utils.clone(),
            ..ShieldedContext::deserialize(&mut &stored_ctx_bytes[..])?
        };

        Ok(())
    }

    async fn save<U: ShieldedUtils>(&self, ctx: &ShieldedContext<U>) -> std::io::Result<()> {
        let mut bytes = Vec::new();
        ctx.serialize(&mut bytes)
            .expect("cannot serialize shielded context");
        let db = Self::build_database().await.map_err(Self::to_io_err)?;

        Self::set_context(&db, JsValue::from_serde(&bytes).unwrap())
            .await
            .map_err(Self::to_io_err)?;

        Ok(())
    }
}

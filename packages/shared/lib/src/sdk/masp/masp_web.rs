use async_trait::async_trait;
use gloo_utils::format::JsValueSerdeExt;
use namada_sdk::borsh::{BorshDeserialize, BorshSerialize};
use namada_sdk::masp::{ContextSyncStatus, DispatcherCache, ShieldedUtils};
use namada_sdk::masp_proofs::prover::LocalTxProver;
use namada_sdk::ShieldedWallet;
use rexie::{Error, ObjectStore, Rexie, TransactionMode};
use wasm_bindgen::{JsError, JsValue};

use crate::utils::to_bytes;

const DB_PREFIX: &str = "namada_sdk::MASP";
const SHIELDED_CONTEXT_TABLE: &str = "ShieldedContext";
const SHIELDED_CONTEXT_KEY_CONFIRMED: &str = "shielded-context-confirmed";
const SHIELDED_CONTEXT_KEY_SPECULATIVE: &str = "shielded-context-speculative";
const SHIELDED_CONTEXT_KEY_TEMP: &str = "shielded-context-temp";

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
#[borsh(crate = "namada_sdk::borsh")]
pub struct WebShieldedUtils {
    spend_param_bytes: Vec<u8>,
    output_param_bytes: Vec<u8>,
    convert_param_bytes: Vec<u8>,
}

impl WebShieldedUtils {
    pub async fn new(
        spend_param_bytes: Vec<u8>,
        output_param_bytes: Vec<u8>,
        convert_param_bytes: Vec<u8>,
    ) -> Result<ShieldedWallet<Self>, JsError> {
        let utils = Self {
            spend_param_bytes,
            output_param_bytes,
            convert_param_bytes,
        };

        let db = Self::build_database().await?;

        let sync_status = if Self::get_context(&db, false, false).await.is_ok() {
            ContextSyncStatus::Speculative
        } else {
            ContextSyncStatus::Confirmed
        };

        Ok(ShieldedWallet {
            utils,
            sync_status,
            ..Default::default()
        })
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

    pub async fn set_context(
        rexie: &Rexie,
        context: JsValue,
        confirmed: bool,
        cache: bool,
    ) -> Result<(), Error> {
        //TODO: add readwriteflush
        let transaction =
            rexie.transaction(&[SHIELDED_CONTEXT_TABLE], TransactionMode::ReadWrite)?;

        let context_store = transaction.store(SHIELDED_CONTEXT_TABLE)?;

        let key = Self::get_key(confirmed, cache);

        context_store
            .put(&context, Some(&JsValue::from_str(key)))
            .await?;

        Ok(())
    }

    async fn get_context(rexie: &Rexie, confirmed: bool, cache: bool) -> Result<JsValue, Error> {
        let transaction =
            rexie.transaction(&[SHIELDED_CONTEXT_TABLE], TransactionMode::ReadOnly)?;

        let context_store = transaction.store(SHIELDED_CONTEXT_TABLE)?;

        let key = Self::get_key(confirmed, cache);
        web_sys::console::log_1(&format!("key {:?}", key).into());

        let context = context_store.get(&JsValue::from_str(key)).await?;

        Ok(context)
    }

    async fn remove_speculative_context(rexie: &Rexie) -> Result<(), Error> {
        let transaction =
            rexie.transaction(&[SHIELDED_CONTEXT_TABLE], TransactionMode::ReadWrite)?;

        let context_store = transaction.store(SHIELDED_CONTEXT_TABLE)?;

        context_store
            .delete(&JsValue::from_str(SHIELDED_CONTEXT_KEY_SPECULATIVE))
            .await?;

        Ok(())
    }

    fn get_key(force_confirmed: bool, cache: bool) -> &'static str {
        if cache {
            SHIELDED_CONTEXT_KEY_TEMP
        } else if force_confirmed {
            SHIELDED_CONTEXT_KEY_CONFIRMED
        } else {
            SHIELDED_CONTEXT_KEY_SPECULATIVE
        }
    }
}

fn get_confirmed(status: &ContextSyncStatus) -> bool {
    match status {
        ContextSyncStatus::Confirmed => true,
        ContextSyncStatus::Speculative => false,
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

    async fn load<U: ShieldedUtils>(
        &self,
        ctx: &mut ShieldedWallet<U>,
        force_confirmed: bool,
    ) -> std::io::Result<()> {
        web_sys::console::log_1(&"loading shielded context 1234".into());

        web_sys::console::log_1(&format!("tree {:?}", ctx.tree).into());
        web_sys::console::log_1(&format!("vk_heights {:?}", ctx.vk_heights).into());
        web_sys::console::log_1(&format!("pos map {:?}", ctx.pos_map).into());
        web_sys::console::log_1(&format!("nf map{:?}", ctx.nf_map).into());
        web_sys::console::log_1(&format!("note map {:?}", ctx.note_map).into());
        web_sys::console::log_1(&format!("div_map {:?}", ctx.div_map).into());
        web_sys::console::log_1(&format!("witness_map {:?}", ctx.witness_map).into());
        web_sys::console::log_1(&format!("spents {:?}", ctx.spents).into());
        web_sys::console::log_1(&format!("asset_types {:?}", ctx.asset_types).into());
        web_sys::console::log_1(&format!("vk_map {:?}", ctx.vk_map).into());
        web_sys::console::log_1(&format!("note_index {:?}", ctx.note_index).into());
        web_sys::console::log_1(&format!("sync_status {:?}", ctx.sync_status).into());

        let db = Self::build_database().await.map_err(Self::to_io_err)?;
        let confirmed = force_confirmed || get_confirmed(&ctx.sync_status);
        web_sys::console::log_1(&format!("confirmed {:?}", confirmed).into());

        let stored_ctx = Self::get_context(&db, confirmed, false)
            .await
            .map_err(Self::to_io_err)?;
        let stored_ctx_bytes = to_bytes(stored_ctx);
        web_sys::console::log_1(&format!("stored_ctx_bytes {:?}", stored_ctx_bytes).into());

        let stored_ctx2 = Self::get_context(&db, true, false)
            .await
            .map_err(Self::to_io_err)?;
        web_sys::console::log_1(&format!("stored_ctx_bytes2 {:?}", to_bytes(stored_ctx2)).into());

        let context: ShieldedWallet<U> = if stored_ctx_bytes.is_empty() {
            ShieldedWallet::default()
        } else {
            ShieldedWallet::deserialize(&mut &stored_ctx_bytes[..])?
        };
        web_sys::console::log_1(&"loading shielded context 5678".into());

        *ctx = ShieldedWallet {
            utils: ctx.utils.clone(),
            ..context
        };

        web_sys::console::log_1(&format!("tree {:?}", ctx.tree).into());
        web_sys::console::log_1(&format!("vk_heights {:?}", ctx.vk_heights).into());
        web_sys::console::log_1(&format!("pos map {:?}", ctx.pos_map).into());
        web_sys::console::log_1(&format!("nf map{:?}", ctx.nf_map).into());
        web_sys::console::log_1(&format!("note map {:?}", ctx.note_map).into());
        web_sys::console::log_1(&format!("div_map {:?}", ctx.div_map).into());
        web_sys::console::log_1(&format!("witness_map {:?}", ctx.witness_map).into());
        web_sys::console::log_1(&format!("spents {:?}", ctx.spents).into());
        web_sys::console::log_1(&format!("asset_types {:?}", ctx.asset_types).into());
        web_sys::console::log_1(&format!("vk_map {:?}", ctx.vk_map).into());
        web_sys::console::log_1(&format!("note_index {:?}", ctx.note_index).into());
        web_sys::console::log_1(&format!("sync_status {:?}", ctx.sync_status).into());

        Ok(())
    }

    async fn save<U: ShieldedUtils>(&self, ctx: &ShieldedWallet<U>) -> std::io::Result<()> {
        let mut bytes = Vec::new();
        ctx.serialize(&mut bytes)
            .expect("cannot serialize shielded context");
        let db = Self::build_database().await.map_err(Self::to_io_err)?;
        let confirmed = get_confirmed(&ctx.sync_status);

        Self::set_context(&db, JsValue::from_serde(&bytes).unwrap(), confirmed, false)
            .await
            .map_err(Self::to_io_err)?;

        if let ContextSyncStatus::Confirmed = ctx.sync_status {
            Self::remove_speculative_context(&db)
                .await
                .map_err(Self::to_io_err)?;
        }

        Ok(())
    }

    /// Save a cache of data as part of shielded sync if that
    /// process gets interrupted.
    async fn cache_save(&self, cache: &DispatcherCache) -> std::io::Result<()> {
        let mut bytes = Vec::new();
        cache.serialize(&mut bytes).expect("cannot serialize cache");

        let db = Self::build_database().await.map_err(Self::to_io_err)?;
        Self::set_context(&db, JsValue::from_serde(&bytes).unwrap(), false, true)
            .await
            .map_err(Self::to_io_err)
    }

    /// Load a cache of data as part of shielded sync if that
    /// process gets interrupted.
    async fn cache_load(&self) -> std::io::Result<DispatcherCache> {
        let db = Self::build_database().await.map_err(Self::to_io_err)?;

        let stored_cache = Self::get_context(&db, false, true)
            .await
            .map_err(Self::to_io_err)?;
        let stored_cache_bytes = to_bytes(stored_cache);

        DispatcherCache::deserialize(&mut &stored_cache_bytes[..])
    }
}

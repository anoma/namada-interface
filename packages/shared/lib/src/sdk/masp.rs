use async_trait::async_trait;
use borsh::{BorshDeserialize, BorshSerialize};
use masp_proofs::prover::LocalTxProver;
use namada::sdk::masp::{ShieldedContext, ShieldedUtils};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use crate::utils::{to_bytes, to_io_error};

const SHIELDED_CONTEXT: &str = "shielded-context";

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
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
        let stored_ctx = get(SHIELDED_CONTEXT).await.map_err(|e| to_io_error(e))?;
        let stored_ctx_bytes = to_bytes(stored_ctx);
        let mut new_ctx: ShieldedContext<WebShieldedUtils> =
            ShieldedContext::deserialize(&mut &stored_ctx_bytes[..])?;

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
        set(SHIELDED_CONTEXT, bytes)
            .await
            .map_err(|e| to_io_error(e))?;

        Ok(())
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "get")]
    async fn get(params: &str) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "set")]
    async fn set(params: &str, data: Vec<u8>) -> Result<JsValue, JsValue>;
}

use async_trait::async_trait;
use borsh::{BorshDeserialize, BorshSerialize};
use js_sys::{Uint8Array, JSON::stringify};
use masp_proofs::prover::LocalTxProver;
use namada::ledger::masp::{ShieldedContext, ShieldedUtils};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use crate::rpc_client::HttpClient;

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

    //TODO: move to utils
    fn to_bytes(u_int_8_array: JsValue) -> Vec<u8> {
        let array = Uint8Array::new(&u_int_8_array);
        array.to_vec()
    }

    fn to_io_error(js_value: JsValue) -> std::io::Error {
        let e = stringify(&js_value).expect("Error to be serializable");
        let e_str: String = e.into();
        std::io::Error::new(std::io::ErrorKind::Other, e_str)
    }
}

#[async_trait(?Send)]
impl ShieldedUtils for WebShieldedUtils {
    type C = HttpClient;

    //TODO: add async version
    fn local_tx_prover(&self) -> LocalTxProver {
        LocalTxProver::from_bytes(
            &self.spend_param_bytes,
            &self.output_param_bytes,
            &self.convert_param_bytes,
        )
    }

    async fn load(self) -> std::io::Result<ShieldedContext<Self>> {
        //TODO: move to const
        let ctx = get("shielded-context")
            .await
            .map_err(|e| Self::to_io_error(e))?;
        let ctx_bytes = Self::to_bytes(ctx);
        let mut new_ctx = ShieldedContext::deserialize(&mut &ctx_bytes[..])?;

        new_ctx.utils = self;
        Ok(new_ctx)
    }

    async fn save(&self, ctx: &ShieldedContext<Self>) -> std::io::Result<()> {
        let mut bytes = Vec::new();
        ctx.serialize(&mut bytes)
            .expect("cannot serialize shielded context");
        set("shielded-context", bytes)
            .await
            .map_err(|e| Self::to_io_error(e))?;

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

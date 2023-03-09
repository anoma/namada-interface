use borsh::{BorshDeserialize, BorshSerialize};
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
}

impl ShieldedUtils for WebShieldedUtils {
    type C = HttpClient;

    fn local_tx_prover(&self) -> LocalTxProver {
        LocalTxProver::from_bytes(
            &self.spend_param_bytes,
            &self.output_param_bytes,
            &self.convert_param_bytes,
        )
    }

    fn load(self) -> std::io::Result<ShieldedContext<Self>> {
        todo!()
    }

    fn save(&self, _ctx: &ShieldedContext<Self>) -> std::io::Result<()> {
        todo!()
    }
}

#[wasm_bindgen(module = "/src/sdk/mod.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "get")]
    async fn get(params: &str) -> Result<JsValue, JsValue>;
}

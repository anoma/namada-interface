use async_trait::async_trait;
use namada::sdk::{
    borsh::{BorshDeserialize, BorshSerialize},
    masp::{ContextSyncStatus, ShieldedContext, ShieldedUtils},
    masp_proofs::prover::LocalTxProver,
};
use wasm_bindgen::{prelude::wasm_bindgen, JsValue};

use std::path::PathBuf;

use crate::utils::to_bytes;

/// Spend circuit name
pub const SPEND_NAME: &str = "masp-spend.params";
/// Output circuit name
pub const OUTPUT_NAME: &str = "masp-output.params";
/// Convert circuit name
pub const CONVERT_NAME: &str = "masp-convert.params";

const FILE_NAME: &str = "shielded.dat";
const TMP_FILE_NAME: &str = "shielded.tmp";
const SPECULATIVE_FILE_NAME: &str = "speculative_shielded.dat";
const SPECULATIVE_TMP_FILE_NAME: &str = "speculative_shielded.tmp";

/// Mostly copied from the Namada CLI

#[derive(Default, Debug, BorshSerialize, BorshDeserialize, Clone)]
#[borsh(crate = "namada::core::borsh")]
pub struct NodeShieldedUtils {
    #[borsh(skip)]
    context_dir: PathBuf,
}

impl NodeShieldedUtils {
    pub async fn new(context_dir: &str) -> ShieldedContext<Self> {
        let context_dir = PathBuf::from(context_dir);

        let spend_path = context_dir.join(SPEND_NAME);
        let convert_path = context_dir.join(CONVERT_NAME);
        let output_path = context_dir.join(OUTPUT_NAME);

        if !(file_exists(spend_path.clone())
            && file_exists(convert_path.clone())
            && file_exists(output_path.clone()))
        {
            Self::fetch_params(spend_path, SPEND_NAME).await;
            Self::fetch_params(convert_path, CONVERT_NAME).await;
            Self::fetch_params(output_path, OUTPUT_NAME).await;
        }

        let sync_status = if std::fs::read(context_dir.join(SPECULATIVE_FILE_NAME)).is_ok() {
            ContextSyncStatus::Speculative
        } else {
            ContextSyncStatus::Confirmed
        };

        let utils = Self { context_dir };

        ShieldedContext {
            utils,
            sync_status,
            ..Default::default()
        }
    }

    async fn fetch_params(path: PathBuf, name: &str) {
        let path = path.to_str().unwrap();
        let response = reqwest::get(format!(
            "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup/{}",
            name
        ))
        .await
        .unwrap();
        let content: Vec<u8> = response.bytes().await.unwrap().into();
        let uint8_array = js_sys::Uint8Array::from(&content[..]);
        write_file_sync(JsValue::from_str(path), uint8_array.into()).unwrap();
    }
}

#[async_trait(?Send)]
impl ShieldedUtils for NodeShieldedUtils {
    fn local_tx_prover(&self) -> LocalTxProver {
        LocalTxProver::with_default_location().expect("unable to load MASP Parameters")
    }

    async fn load<U: ShieldedUtils>(
        &self,
        ctx: &mut ShieldedContext<U>,
        force_confirmed: bool,
    ) -> std::io::Result<()> {
        let file_name = if force_confirmed {
            FILE_NAME
        } else {
            match ctx.sync_status {
                ContextSyncStatus::Confirmed => FILE_NAME,
                ContextSyncStatus::Speculative => SPECULATIVE_FILE_NAME,
            }
        };

        let path = path_buf_to_js_value(self.context_dir.join(file_name));
        //TODO: change to_bytes to sth more descripive, add "from_bytes"
        let bytes = to_bytes(read_file_sync(path).unwrap().into());

        *ctx = ShieldedContext {
            utils: ctx.utils.clone(),
            ..ShieldedContext::<U>::deserialize(&mut &bytes[..])?
        };
        Ok(())
    }

    async fn save<U: ShieldedUtils>(&self, ctx: &ShieldedContext<U>) -> std::io::Result<()> {
        let (tmp_file_name, file_name) = match ctx.sync_status {
            ContextSyncStatus::Confirmed => (TMP_FILE_NAME, FILE_NAME),
            ContextSyncStatus::Speculative => (SPECULATIVE_TMP_FILE_NAME, SPECULATIVE_FILE_NAME),
        };

        let tmp_path = path_buf_to_js_value(self.context_dir.join(tmp_file_name));
        {
            let mut bytes = Vec::new();
            ctx.serialize(&mut bytes)
                .expect("cannot serialize shielded context");
            let uint8_array = js_sys::Uint8Array::from(&bytes[..]);

            write_file_sync(tmp_path.clone(), uint8_array.into()).unwrap();
        }

        let new_path = path_buf_to_js_value(self.context_dir.join(file_name));
        renameSync(tmp_path, new_path).unwrap();

        if let ContextSyncStatus::Confirmed = ctx.sync_status {
            unlinkSync(path_buf_to_js_value(
                self.context_dir.join(SPECULATIVE_FILE_NAME),
            ))
            .unwrap();
        }

        Ok(())
    }
}

fn path_buf_to_js_value(path: PathBuf) -> JsValue {
    JsValue::from_str(path.to_str().unwrap())
}

fn file_exists(path: PathBuf) -> bool {
    exists_sync(path_buf_to_js_value(path))
        .unwrap()
        .as_bool()
        .unwrap()
}

#[wasm_bindgen(module = "/src/sdk/masp/masp_node.js")]
extern "C" {
    #[wasm_bindgen(catch, js_name = "writeFileSync")]
    fn write_file_sync(path: JsValue, content: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "readFileSync")]
    fn read_file_sync(path: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "renameSync")]
    fn renameSync(pathA: JsValue, pathB: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "unlinkSync")]
    fn unlinkSync(path: JsValue) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(catch, js_name = "existsSync")]
    fn exists_sync(path: JsValue) -> Result<JsValue, JsValue>;
}

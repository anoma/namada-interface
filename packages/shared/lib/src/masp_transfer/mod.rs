use async_trait::async_trait;
use borsh::{BorshDeserialize, BorshSerialize};
use js_sys::JsString;
use masp_primitives::asset_type::AssetType;
use masp_primitives::merkle_tree::MerklePath;
use masp_primitives::sapling::Node;
use masp_primitives::transaction::components::Amount;
use masp_proofs::prover::LocalTxProver;
use namada_for_masp as namada;
use namada_for_masp::ledger::masp::ShieldedUtils;
use namada_for_masp::types::storage::Key;
use wasm_bindgen::prelude::*;


// required as a supertrait by ShieldedUtils
impl Default for WebShieldedUtils {
    fn default() -> Self {
        WebShieldedUtils {}
    }
}

// This is being passed to MASP creating util. This mostly contains callsbacks
// that are specific to the platform (MacOS, Linux, Web(WAMS), ...) where the
// MASP transactiosn are being created
#[derive(Debug, BorshSerialize, BorshDeserialize, Clone)]
struct WebShieldedUtils {}

// for documentation for this trait refer to
// namada::ledger::masp::ShieldedUtils trait from
// https://github.com/anoma/namada repo
//
// the js implementations of these callbacks are in folder indicated by the
// raw_module statement connected with the  extern block below
#[async_trait]
impl ShieldedUtils for WebShieldedUtils {
    fn local_tx_prover(&self) -> LocalTxProver {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let local_tx_prover = web_shielded_utils_js_callbacks.local_tx_prover_callback(0);
        let local_tx_prover_as_str = local_tx_prover.as_string().unwrap();
        console_log(&local_tx_prover_as_str);
        !unimplemented!("returns a prover that was constructed with the parameter files")
    }

    fn save(&self, ctx: &namada::ledger::masp::ShieldedContext<Self>) -> std::io::Result<()> {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let shielded_context = web_shielded_utils_js_callbacks.save(0);
        let shielded_context_as_str = shielded_context.as_string().unwrap();
        console_log(&shielded_context_as_str);
        !unimplemented!("this func does not do anything for now")
    }

    fn load(self) -> std::io::Result<namada::ledger::masp::ShieldedContext<Self>> {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let shielded_context = web_shielded_utils_js_callbacks.load(0);
        let shielded_context_as_str = shielded_context.as_string().unwrap();
        console_log(&shielded_context_as_str);
        !unimplemented!("this func returns the shielded notes that were fetched in js for now")
    }

    async fn query_conversion(
        &self,
        asset_type: AssetType,
    ) -> Option<(
        namada::types::address::Address,
        namada::types::storage::Epoch,
        Amount,
        MerklePath<Node>,
    )> {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let conversion = web_shielded_utils_js_callbacks.query_conversion(0);
        let conversion_as_str = conversion.as_string().unwrap();
        console_log(&conversion_as_str);
        !unimplemented!("this will have to query the endpoint for a specific path, but it does not have to do anything except return the data")
    }

    async fn query_epoch(&self) -> namada::types::storage::Epoch {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let epoch = web_shielded_utils_js_callbacks.query_epoch(0);
        let epoch_as_str = epoch.as_string().unwrap();
        console_log(&epoch_as_str);
        !unimplemented!("returns the epoch, use the existing code for this")
    }

    async fn query_storage_value<T: Send>(&self, key: &namada::types::storage::Key) -> Option<T>
    where
        T: BorshDeserialize,
    {
        let web_shielded_utils_js_callbacks = WebShieldedUtilsJsCallbacks::new();
        let storage_value_byte_array = web_shielded_utils_js_callbacks.query_storage_value(0);
        let storage_value_byte_arrayh_as_str = storage_value_byte_array.as_string().unwrap();
        console_log(&storage_value_byte_arrayh_as_str);
        !unimplemented!("returns an encrypted value that was fetched by storage path")
    }
}

#[wasm_bindgen]
pub fn create_masp_transfer() -> u8 {
    0
}

// - this maps callbacks from js to Rust signatures
// - they live in WebShieldedUtilsJsCallbacks that contains a class of the same name
// - the path defined below at raw_module refers to the location of the destination of
//   where the resulting glue code gets copied to by by the script. The script is at
//   ./scripts/build.sh at the root of this module
#[wasm_bindgen(raw_module = "../callbacksForWasm/WebShieldedUtilsJsCallbacks")]
extern "C" {

    // this is the js class containing all the callbacks and utils
    #[wasm_bindgen(js_class = "WebShieldedUtilsJsCallbacks")]
    type WebShieldedUtilsJsCallbacks;

    // constructor for the class so we get the ::new method
    #[wasm_bindgen(constructor)]
    fn new() -> WebShieldedUtilsJsCallbacks;

    // returns the local transaction prover
    #[wasm_bindgen(
        method,
        js_class = "WebShieldedUtilsJsCallbacks",
        js_name = "localTxProverCallback"
    )]
    fn local_tx_prover_callback(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;

    // this saves the shielded context. This is an optimization, that helps to
    // prevent the client having to fetch all the shielded notes again and again.
    #[wasm_bindgen(method, js_class = "WebShieldedUtilsJsCallbacks", js_name = "save")]
    fn save(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;

    // this loads the persisted context. This is an optimization, that helps to
    // prevent the client having to fetch all the shielded notes again and again.
    // this loads what WebShieldedUtilsJsCallbacks.save saves
    #[wasm_bindgen(method, js_class = "WebShieldedUtilsJsCallbacks", js_name = "load")]
    fn load(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;

    // queries the conversion from the chain
    #[wasm_bindgen(
        method,
        js_class = "WebShieldedUtilsJsCallbacks",
        js_name = "queryConversion"
    )]
    fn query_conversion(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;

    // queries the epoch from the chain
    #[wasm_bindgen(
        method,
        js_class = "WebShieldedUtilsJsCallbacks",
        js_name = "queryEpoch"
    )]
    fn query_epoch(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;

    // queries a storage value from the chain based on the storage path being passed in
    #[wasm_bindgen(
        method,
        js_class = "WebShieldedUtilsJsCallbacks",
        js_name = "queryStorageValue"
    )]
    fn query_storage_value(this: &WebShieldedUtilsJsCallbacks, placeholder: u32) -> JsString;
}

// maps js console.log() for debugging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn console_log(s: &str);
}

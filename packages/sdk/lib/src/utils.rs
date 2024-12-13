use gloo_utils::format::JsValueSerdeExt;
use js_sys::Uint8Array;
use orion::kdf;
use serde::Serialize;
use std::fmt::Debug;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

#[allow(dead_code)]
pub fn console_log(string: &str) {
    log(string);
}

#[allow(dead_code)]
pub fn console_log_any<T: Debug>(string: &T) {
    log(format!("{:?}", string).as_str());
}

pub fn to_bytes(u_int_8_array: JsValue) -> Vec<u8> {
    let array = Uint8Array::new(&u_int_8_array);
    array.to_vec()
}

/// Maps a result to a JsValue using Serde and Error into a JsError
///
/// # Arguments
///
/// * `result` - The result to map
pub fn to_js_result<T>(result: T) -> Result<JsValue, JsError>
where
    T: Serialize,
{
    match JsValue::from_serde(&result) {
        Ok(v) => Ok(v),
        Err(e) => Err(JsError::new(&e.to_string())),
    }
}

#[cfg(feature = "dev")]
pub fn set_panic_hook() {
    web_sys::console::log_1(&"Set panic hook".into());
    console_error_panic_hook::set_once();
}

#[cfg(not(feature = "dev"))]
pub fn set_panic_hook() {}

/// Derive an encryption key from a password.
pub fn encryption_key(salt: &kdf::Salt, password: String) -> kdf::SecretKey {
    kdf::Password::from_slice(password.as_bytes())
        .and_then(|password| kdf::derive_key(&password, salt, 3, 1 << 16, 32))
        .expect("Generation of encryption secret key shouldn't fail")
}

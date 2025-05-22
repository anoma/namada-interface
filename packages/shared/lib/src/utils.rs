use gloo_utils::format::JsValueSerdeExt;
use js_sys::{Promise, Uint8Array};
use serde::Serialize;
use std::fmt::Debug;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::JsFuture;

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

pub fn set_panic_hook() {
    web_sys::console::log_1(&"Set panic hook".into());
    console_error_panic_hook::set_once();
}

/// Sleep function using setTimeout wrapped in a JS Promise
pub async fn sleep(ms: i32) {
    let promise = Promise::new(&mut |resolve, _reject| {
        web_sys::window()
            .unwrap()
            .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, ms)
            .unwrap();
    });

    let _ = JsFuture::from(promise).await;
}

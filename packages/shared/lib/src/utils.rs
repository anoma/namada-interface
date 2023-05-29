use js_sys::{Uint8Array, JSON};
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

pub fn to_io_error(js_value: JsValue) -> std::io::Error {
    let e = JSON::stringify(&js_value).expect("Error to be serializable");
    let e_str: String = e.into();
    std::io::Error::new(std::io::ErrorKind::Other, e_str)
}

use chrono::{TimeZone, Utc};
use namada::types::time::DateTimeUtc;

use wasm_bindgen::prelude::*;

/// Get a valid UTC timestamp from the JavaScript engine
pub fn get_timestamp() -> DateTimeUtc {
    let now = js_sys::Date::new_0();

    let year = now.get_utc_full_year() as i32;
    let month: u32 = now.get_utc_month() + 1;
    let day: u32 = now.get_utc_date();
    let hour: u32 = now.get_utc_hours();
    let min: u32 = now.get_utc_minutes();
    let sec: u32 = now.get_utc_seconds();

    let utc = Utc.ymd(year, month, day).and_hms(hour, min, sec);
    DateTimeUtc(utc)
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

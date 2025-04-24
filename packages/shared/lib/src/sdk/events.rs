use crate::utils::to_js_result;
use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::{CustomEvent, CustomEventInit, WorkerGlobalScope};

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct ProgressStart {
    name: String,
}

impl ProgressStart {
    pub fn to_json(&self) -> JsValue {
        let json = serde_json::to_value(self).unwrap();
        JsValue::from_str(&json.to_string())
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct ProgressFinish {
    name: String,
}

impl ProgressFinish {
    pub fn to_json(&self) -> JsValue {
        let json = serde_json::to_value(self).unwrap();
        JsValue::from_str(&json.to_string())
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct ProgressIncrement {
    name: String,
    current: usize,
    total: usize,
}

impl ProgressIncrement {
    pub fn to_json(&self) -> JsValue {
        let json = serde_json::to_value(self).unwrap();
        JsValue::from_str(&json.to_string())
    }
}

/// Event constants for use in Rust
pub const SDK_EVENT_PROGRESS_BAR_STARTED: &str = "namada_sdk::progress_bar::started";
pub const SDK_EVENT_PROGRESS_BAR_INCREMENTED: &str = "namada_sdk::progress_bar::incremented";
pub const SDK_EVENT_PROGRESS_BAR_FINISHED: &str = "namada_sdk::progress_bar::finished";

// This will generate proper enum in TypeScript, the downisde is that we need to copy the values.
// Unfortunately we can't use macros here.
#[wasm_bindgen(typescript_custom_section)]
const SDK_EVENTS: &'static str = r#"
export enum SdkEvents {
    ProgressBarStarted = "namada_sdk::progress_bar::started",
    ProgressBarIncremented = "namada_sdk::progress_bar::incremented",
    ProgressBarFinished = "namada_sdk::progress_bar::finished",
}
"#;

#[wasm_bindgen]
pub struct SdkEvents {}

#[wasm_bindgen]
impl SdkEvents {
    #[allow(non_snake_case)]
    #[wasm_bindgen(getter)]
    pub fn ProgressBarStarted() -> String {
        SDK_EVENT_PROGRESS_BAR_STARTED.to_string()
    }

    #[allow(non_snake_case)]
    #[wasm_bindgen(getter)]
    pub fn ProgressBarIncremented() -> String {
        SDK_EVENT_PROGRESS_BAR_INCREMENTED.to_string()
    }

    #[allow(non_snake_case)]
    #[wasm_bindgen(getter)]
    pub fn ProgressBarFinished() -> String {
        SDK_EVENT_PROGRESS_BAR_FINISHED.to_string()
    }
}

pub struct EventDispatcher {
    scope: WorkerGlobalScope,
}

impl EventDispatcher {
    pub fn new() -> Self {
        let global = js_sys::global();
        // We assume that the scope is always worker global scope
        let scope = global.unchecked_into::<WorkerGlobalScope>();

        Self { scope }
    }

    fn dispatch_custom_event(&self, custom_event: CustomEvent) -> Result<JsValue, JsError> {
        to_js_result(
            self.scope
                .dispatch_event(&custom_event)
                .map_err(|err| JsError::new(&format!("Error dispatching: {:?}", err)))?,
        )
    }

    pub fn progress_bar_started(&self, name: String) -> Result<JsValue, JsError> {
        let start = ProgressStart { name };
        let options = CustomEventInit::new();
        options.set_detail(&start.to_json());

        let event = CustomEvent::new_with_event_init_dict(SDK_EVENT_PROGRESS_BAR_STARTED, &options)
            .unwrap();

        self.dispatch_custom_event(event)
    }

    pub fn progress_bar_incremented(
        &self,
        name: String,
        current: usize,
        total: usize,
    ) -> Result<JsValue, JsError> {
        let increment = ProgressIncrement {
            name,
            current,
            total,
        };
        let options = CustomEventInit::new();
        options.set_detail(&increment.to_json());

        let event =
            CustomEvent::new_with_event_init_dict(SDK_EVENT_PROGRESS_BAR_INCREMENTED, &options)
                .unwrap();

        self.dispatch_custom_event(event)
    }

    pub fn progress_bar_finished(&self, name: String) -> Result<JsValue, JsError> {
        let finish = ProgressFinish { name };
        let options = CustomEventInit::new();
        options.set_detail(&finish.to_json());

        let event =
            CustomEvent::new_with_event_init_dict(SDK_EVENT_PROGRESS_BAR_FINISHED, &options)
                .unwrap();

        self.dispatch_custom_event(event)
    }
}

impl Default for EventDispatcher {
    fn default() -> Self {
        Self::new()
    }
}

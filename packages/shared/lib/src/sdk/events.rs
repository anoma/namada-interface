use crate::utils::to_js_result;
use serde::Serialize;
use wasm_bindgen::prelude::*;
use web_sys::{CustomEvent, CustomEventInit, Document, Event};

#[wasm_bindgen]
#[derive(Debug, Serialize)]
pub struct ProgressIncrement {
    current: usize,
    total: usize,
}

impl ProgressIncrement {
    pub fn to_json(&self) -> JsValue {
        let json = serde_json::to_value(&self).unwrap();
        JsValue::from_str(&json.to_string())
    }
}

/// Event constants for use in Rust
const SDK_EVENT_PROGRESS_BAR_STARTED: &str = "namada_sdk::progress_bar::started";
const SDK_EVENT_PROGRESS_BAR_INCREMENTED: &str = "namada_sdk::progress_bar::incremented";
const SDK_EVENT_PROGRESS_BAR_FINISHED: &str = "namada_sdk::progress_bar::finished";

pub struct EventDispatcher {
    document: Document,
}

impl EventDispatcher {
    pub fn new() -> Self {
        Self {
            document: web_sys::window().unwrap().document().unwrap(),
        }
    }

    fn dispatch(&self, event: Event) -> Result<JsValue, JsError> {
        to_js_result(
            self.document
                .dispatch_event(&event)
                .map_err(|err| JsError::new(&format!("Error dispatching event: {:?}", err)))?,
        )
    }

    fn dispatch_custom_event(&self, custom_event: CustomEvent) -> Result<JsValue, JsError> {
        to_js_result(
            self.document
                .dispatch_event(&custom_event)
                .map_err(|err| JsError::new(&format!("Error dispatching: {:?}", err)))?,
        )
    }

    pub fn progress_bar_started(&self) -> Result<JsValue, JsError> {
        // let event = Event::new(SDK_EVENT_PROGRESS_BAR_STARTED).unwrap();
        let event = self.document.create_event("Event").unwrap();
        event.init_event(SDK_EVENT_PROGRESS_BAR_STARTED);
        self.dispatch(event)
    }

    pub fn progress_bar_incremented(
        &self,
        current: usize,
        total: usize,
    ) -> Result<JsValue, JsError> {
        let increment = ProgressIncrement { current, total };

        let data = &increment.to_json();

        let mut options = CustomEventInit::new();

        options.detail(data);
        options.bubbles(true);
        options.cancelable(false);
        options.composed(true);

        let event =
            CustomEvent::new_with_event_init_dict(SDK_EVENT_PROGRESS_BAR_INCREMENTED, &options)
                .unwrap();

        self.dispatch_custom_event(event)
    }

    pub fn progress_bar_finished(&self) -> Result<JsValue, JsError> {
        let event = Event::new(SDK_EVENT_PROGRESS_BAR_FINISHED).unwrap();
        self.dispatch(event)
    }
}

use namada::types::io::Io;
use wasm_bindgen::JsValue;

fn read(question: Option<&str>) -> std::io::Result<String> {
    match web_sys::window() {
        Some(w) => {
            let question = question.unwrap_or("Input: ");
            let input = w
                .prompt_with_message(question)
                .expect("Prompt to be defined");

            input.ok_or(std::io::Error::new(
                std::io::ErrorKind::Other,
                "Input is null",
            ))
        }
        None => Err(std::io::Error::new(std::io::ErrorKind::Other, "No window")),
    }
}

pub struct WebIo;

#[async_trait::async_trait(?Send)]
impl Io for WebIo {
    /// Print to the console.log
    ///
    /// # Arguments
    ///
    /// * `output` - The output to print
    fn print(&self, output: impl AsRef<str>) {
        web_sys::console::log_1(&output.as_ref().into());
    }

    /// Print to the console.log with newline
    ///
    /// # Arguments
    ///
    /// * `output` - The output to print
    fn println(&self, output: impl AsRef<str>) {
        let js_output: JsValue = format!("{}\n", output.as_ref()).into();
        web_sys::console::log_1(&js_output);
    }

    /// Print to the console.error with newline
    ///
    /// # Arguments
    ///
    /// * `output` - The output to print
    fn eprintln(&self, output: impl AsRef<str>) {
        let js_output: JsValue = format!("{}\n", output.as_ref()).into();
        web_sys::console::error_1(&js_output);
    }

    /// Read from the prompt
    ///
    /// **Note**: Works only in the context of a document(WebWorkers and ServiceWorkers are not supported)
    async fn read(&self) -> std::io::Result<String> {
        read(None)
    }

    /// Read from the prompt with a question
    ///
    /// **Note**: Works only in the context of a document(WebWorkers and ServiceWorkers are not supported)
    async fn prompt(&self, question: impl AsRef<str>) -> String {
        read(Some(question.as_ref())).unwrap_or(String::from(""))
    }
}

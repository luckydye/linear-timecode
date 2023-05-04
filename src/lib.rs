use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
pub fn greet() {
    console::log_1(&"Hello, test-wasm!".into());
}

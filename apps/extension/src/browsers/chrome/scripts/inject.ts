import { inject as injectContent } from "../../../content/injected";
import { inject as injectWasm } from "../../../wasm";

/**
 * Inject scripts for Chrome
 */

// Content-Scripts
injectContent();

// Proxy to WASM functionality
injectWasm();

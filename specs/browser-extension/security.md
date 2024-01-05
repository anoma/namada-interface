# Browser Extension - Security

The different components of this browser extension need to be able to communicate with each other, and as such make use of the `window.postMessage` and
the `browser.runtime.onMessage` APIs to exchange messages between the web client, content and background scripts.

The process roughly looks like this:

1. Web client can utilize `postMessage` (via an injected script from the extension) to send a message to an instantiated proxy
2. The content script can listen for these messages from the proxy and route them to the background script
3. The background script can handle these messages and routes responses to the content script
4. Finally, the content script can relay this message via `postMessage` to the injected script on the web client

## Origin validation

When the `postMessage` API is being used, we check that the origin matches. This validation is necessary to avoid cross-domain messages from occurring.

In addition, we also implement [https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#connection-based_messaging](connection-based messaging)
when communicating between the web client and the content scripts. This requires that we establish a "port" over which we post messages.

## Routing

When the extension is installed, the content and background scripts establish a shared state variable, `namadaExtensionRouterId`, stored in the extension's `localStorage`, which allows
us to validate messages between the two before performing any actions in the background scripts.

## Handling sensitive data in WASM memory

Values that should be kept secret are handled specially in order to
prevent them from being read from memory by an attacker. The measures
we take are:

1. Temporary sensitive values used in Rust code are zeroized in memory
   after they are done being used.

2. Sensitive values are wrapped in structs. (See ./packages/crypto/lib/src/crypto/pointer_types.rs.)

   a. These structs have the ZeroizeOnDrop trait, so sensitive values
   will automatically be zeroized when the struct is dropped.

   b. Passing a struct between JavaScript and WASM does not reveal the
   contents of the struct. This lets us avoid putting sensitive values
   in JavaScript memory, where we cannot ensure they are zeroized.

   c. If a sensitive value is needed in JavaScript, it can be
   optionally read directly from WASM memory by using the pointer and
   length fields of the struct. (See ./packages/crypto/src/utils.ts.)

3. Methods that handle sensitive data and are not needed in JavaScript
   are hidden using `#[wasm_bindgen(skip_typescript)]`.

## Resources

- [https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#connection-based_messaging](Connection-Based Messaging)
- [https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime](WebExtensions API - browser runtime)
- [https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage](postMessage API)

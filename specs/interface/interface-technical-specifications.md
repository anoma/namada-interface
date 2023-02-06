# Client Application

### React Web Application

- Built with TypeScript
- State-management with Redux Toolkit (`@reduxjs/toolkit`)
- Styled-Componenents for all application/component styling
- `webpack` build with `webpack-dev-server`

## WebAssembly Library

Much of the core functionality of the web app requires either direct interfacing with types from the Namaea codebase,
or other Rust libraries that provide encryption, key-management, mnemonic-generation, etc., that are more easily and
robustly handled in the Rust ecosystem than that of TypeScript. Presently, functionality related to cryptography and
`Namada` transactions exist in `packages/crypto` and `packages/shared`, respectively. Note that development is currently
underway to update the functionality in `packages/shared` to instead integrate with a shared SDK (shared Namada functionality
between the CLI and web apps).

Here, we have several types that are essentially built on top of `namada` types, allowing us to interface easily from the client app, such as `address`, `keypair`, `tx`, and `wrapper`, then a generic `transaction` type that handles the logic common to all transactions. Essentially, we want these types to handle any serialization that the `anoma` types require entirely within the wasm, then later translate the results into something the client can understand.

Outside of types, we have an `account.rs` file that allows us to call account functions, such as `initialize` (to construct an "init-account" transaction), from the client app. `transfer.rs` is similar, in that it provides the bridge for the client to issue a transfer transaction. Additional transactions can be easily created in this way, with a specific differences being handled in a top level Rust source file, the common logic of transactions handled by `types/transaction`, and any types that need extra work in order to be useful to the client being added as well to `types`.

## Interfacing between the Client and WebAssembly

When compiling the `wasm` utilizing `wasm-pack`, we get the associated JavaScript source to interact with the WebAssembly output, as well as a TypeScript type definition file. When we set the `wasm-pack` target to `web`, we get an additional exported `init` function, which is a promise that resolves when the wasm is fully loaded, exposing the `memory` variable. In most cases we shouldn't need to interact directly with the memory of the wasm, but by awaiting the `init()` call, we can immediately execute any of the wasm methods.

The goal of bridging wasm and the client TypeScript application should be to make its usage as straightforward as any TypeScript class. It should also be fairly easy for the developer to add new features to the Rust source and quickly bring that into the client app.

### Dealing with Rust types in TypeScript

One of the challenges of working with WebAssembly is how we might go about handling types from Rust code. We are limited to what JavaScript can handle, and often when serializing output from the wasm, we'll choose a simple type like `string` or `number`, or send the data as a byte array (very common, especially when dealing with numbers larger than JavaScript can handle by default). Sending raw data to the client is often a decent solution, then any encoding we prefer we can enact on the client-side (hexadecimal, base58, base64, etc), and choosing a Rust type like `Vec<u8>` makes this straight-forward. _(More to come on this topic in the future)_

There is much more nuance to handling types from Rust wasm in TypeScript when working with `wasm-bindgen`, and more information can be found at the following URL:

https://rustwasm.github.io/wasm-bindgen/reference/types.html

## Testing with WebAssembly

Namada Interface should be able to run within the Jest testing framework. This is made possibly by switching our `wasm-pack` target and rebuilding before the test is run, as tests run within NodeJS. So, instead of the following:

```bash
wasm-pack build ../packages/shared/lib/ --out-dir ../shared/src/shared --out-name shared --target web

```

We would issue this in order to support Jest in NodeJS:

```bash
wasm-pack build ../packages/shared/lib/ --out-dir ../shared/src/shared --out-name shared --target nodejs
```

Currently, the Rust libraries `packages/crypto` and `packages/shared` have both Rust tests (issued via the `cargo test` command), as well as tests via Jest & TypeScript which import the compiled
Rust code as WebAssembly, with the generated TypeScript types, and issues similar tests in this environment.

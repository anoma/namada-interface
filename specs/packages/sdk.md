# Sdk

Sdk is a part of shared package. It's main purpose is to wrap shared logic from the namada crate, so it can be used in the context of the browser.

Modules:

- [masp](#masp)
- [tx](#tx)
- [wallet](#wallet)
- [sdk](#sdk)

## masp

Contains implementation of the `ShieldedUtils` trait. It is responsible for:

- loading and saving spend, convert and output params into and from the browser storage.
- serializing and deserializing params for read/write
- creating LocalTxProver needed for creating MASP proof

## tx

Encapsulates functionality for deserialization and mapping of byte arrays into Rust structures.
Contains:

- Definitions of structs representing transaction messages. Message is a BorshSerialized JsValue that represents all the data needed to create a transaction.
- Mapping functions which deserialize transaction messages and map those for proper transaction arguments

## wallet

Contains the logic for:

- encoding/decoding wallet store
- adding keys/spending kest

### Why we are not using key generation functions from the Namada Shared?

Currently, the Namada extension derives keys based on a mnemonic, while Namada derives keys based on a source of randomness (`OsRng`). As such, we have introduced functions that allow us to add keys derived within the extension into Sdk's wallet storage. This will most likely change in future after Namada introduces support for mnemonics into the Sdk.

## sdk

Sdk struct wraps logic from the other modules, creating public API using `wasm_bindgen`.

## About wallet storage

At the moment, the client of the Sdk is responsible for keeping storage in sync with the Sdk's wallet instance. What does that mean? The Namada extension has its own key storage, which is modified by user actions. Every time the extension storage changes (for example, when a new address is derived), we must manually sync the extension and Sdk wallet storage
using functions provided by `wallet` module. This is something that will most likely change in the future.

## How can you import and use the SDK?
First you need to build the shared package. We do that using `wasm-pack`.
You can take a look at [build.sh](https://github.com/anoma/namada-interface/blob/main/packages/shared/scripts/build.sh) and wasm-pack specific configuration in [Cargo.toml](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/Cargo.toml)
After build is done you should see built files in the `src/shared/*`
```
LICENSE_MIT
package.json
README.md
shared.d.ts
shared.js
shared_bg.js
shared_bg.wasm
shared_bg.wasm.d.ts
```
You can take a look at `shared.d.ts` to see what is exported.

Next step would be to import SDK itself.
For now we wrap all of the SDK logic in the [Sdk struct](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/sdk/mod.rs) and [Query struct](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/query.rs). Main reason we do that is to not pass things like `HttpClient`, `Wallet` and `ShieldedContext` every time we want to submit new transaction or query data. This will most likely change in future as we are sometimes getting "multiple mutable references" Rust error.

To use structs (almost)all you have to do is to create new instance:
```ts
import { Query, Sdk } from "@namada/shared";

const sdk = new Sdk(URL_OF_NAM_NODE);
const query = new Query(URL_OF_NAM_NODE);
```
Why almost?
Query is ready to use. When it comes to the Sdk though there is one more resposibility for the client. This might also change in future. Basically client is responsible for:
- persisting, encoding and decoding of [wallet](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/sdk/wallet.rs) state
- adding keys to the [wallet](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/sdk/wallet.rs) struct

To get a better view look for `sdk.decode`, `sdk.encode`, `sdk.add_key`, `sdk.add_spending_key` calls in the `@namada/extension` app.

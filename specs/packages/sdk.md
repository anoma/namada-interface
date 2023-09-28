# Sdk

Sdk is a part of shared package. It's main purpose is to wrap shared logic from the namada crate, so it can be used in the context of the browser. For examples of usage, see [examples.md](./examples.md).

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
First, we need to compile the [shared](https://github.com/anoma/namada-interface/tree/main/packages/shared/lib) package to a wasm target, which is done using [wasm-pack](https://rustwasm.github.io/wasm-pack/).
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
The file `shared.d.ts` contains the exported TypeScript type definitions.

Next step would be to import SDK itself.
For now, we wrap all of the SDK logic in the [Sdk struct](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/sdk/mod.rs) and [Query struct](https://github.com/anoma/namada-interface/blob/main/packages/shared/lib/src/query.rs). Creating instances of the `Sdk` and `Query` structs allows us to persist instances of `HttpClient`, `Wallet`, and `ShieldedContext` for the duration of the service-worker lifetime, making them immediately available to any calls invoked by the extension. Currently, the `namada` SDK requires that references to `Wallet` and `HttpClient` instances be mutable, which presents an issue when attempting to execute SDK functionality in parallel. In the SDK's current implementation, calls should be made sequentially.

Within the extension, we create instances of `Sdk` and `Query` as follows:
```ts
// Import Sdk & Query
import { Query, Sdk } from "@namada/shared";
// Import wasm initialization function
import { init as initShared } from "@namada/shared/src/init";

async function init() {
  await initShared();

  const sdk = new Sdk(RPC_URL_OF_NAM_NODE);
  const query = new Query(RPC_URL_OF_NAM_NODE);

  // ...
}

init();
```

**NOTE**: Regarding this instance of `Sdk`, it is the client's responsibility to persist the wallet state in storage, as well as to populate the wallet state with any new keys created by the user. The `Sdk` class has methods for exporting and restoring state, as well as adding keys:

- sdk.encode() - Encode the SDK state for storage within the extension
- sdk.decode() - Decode and load the SDK state into the current app
- sdk.add_key() - Add key to SDK state
- sdk.add_spending_key() - Add MASP spending key to SDK state

The overall public API of the Sdk struct is as follows:
```ts
/**
* Represents the Sdk public API.
*/
export class Sdk {
  free(): void;
  constructor(url: string);
  static has_masp_params(): Promise<any>;
  static fetch_and_store_masp_params(): Promise<void>;
  load_masp_params(): Promise<void>;
  encode(): Uint8Array;
  decode(data: Uint8Array): void;
  clear_storage(): void;
  add_key(private_key: string, password?: string, alias?: string): void;
  add_spending_key(xsk: string, password: string | undefined, alias: string): void;
  submit_signed_reveal_pk(tx_msg: Uint8Array, tx_bytes: Uint8Array, raw_sig_bytes: Uint8Array, wrapper_sig_bytes: Uint8Array): Promise<void>;
  build_tx(tx_type: number, tx_msg: Uint8Array, gas_payer: string): Promise<any>;
  submit_signed_tx(tx_msg: Uint8Array, tx_bytes: Uint8Array, raw_sig_bytes: Uint8Array, wrapper_sig_bytes: Uint8Array): Promise<void>;
  submit_transfer(tx_msg: Uint8Array, password?: string, xsk?: string): Promise<void>;
  submit_ibc_transfer(tx_msg: Uint8Array, password?: string): Promise<void>;
  submit_bond(tx_msg: Uint8Array, password?: string): Promise<void>;
  submit_unbond(tx_msg: Uint8Array, password?: string): Promise<void>;
  submit_withdraw(tx_msg: Uint8Array, password?: string): Promise<void>;
}
```

It is important to note that many of these methods expect a Borsh-serialized message representing the transaction (`Uint8Array`). For an overview of the schemas used to define these messages, see [schema.ts](https://github.com/anoma/namada-interface/tree/main/packages/types/src/tx/schema). The extension uses [borsh-ts](https://github.com/dao-xyz/borsh-ts) to encode these messages. To use these schema in your TypeScript app, they must be imported from the @namada/types package.

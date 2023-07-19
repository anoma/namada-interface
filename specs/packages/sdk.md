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

## Packages in namada-interface

Both applications under `apps` (`extension` and `namada-interface`) make use of shared packages defined in `packages`. These are "public" packages
with shared functionality across these two apps.

Available packages:

- [chains](#chains) [TypeScript]
- [components](#components) [TypeScript/React]
- [crypto](#crypto) [Rust, with TypeScript bindings and tests]
- [integrations](#integrations) [TypeScript]
- [rpc](#rpc) [TypeScript]
- [shared](#shared) [Rust, with TypeScript bindings and tests]
- [storage](#storage) [TypeScript]
- [types](#types) [TypeScript]
- [utils](#utils) [TypeScript]

## chains

The `chains` package contains definitions for chains that are configured to work with `namada-interface`. Any relevant information regarding a chain should
be stored here, such as a URL, name, related extension (required for connecting accounts), etc. The Namada chain config is naturally stored here as well.
When the interface loads, it will grab the definitions in this package to display to the user.

## components

This package is simply various React components that are shared between `namada-interface` and the `extension`.

## crypto

The cryptography functions used by the browser extension are defined here within the Rust source. This package includes the build necessary to initialize
and run the Wasm output in a web application.

Aside from `wasm-bindgen` bindings for Rust cryptography libraries, this package includes the following files:

- `bip32.rs` - Exports functionality for key-derivation using BIP32 & BIP44 derivation paths
- `bip39.rs` - Exports support for generating Mnemonic Seeds
- `zip32.rs` - Exports functionality for deriving shielded keys from a seed

## integrations

This package introduces an `Integration` interface, which wraps the APIs of various extensions to expose a
single API to the interface. Currently, this supports integrations with Keplr, Metamask, and the Namada browser extension.

## rpc

The `rpc` package is primarily a legacy package that extended the `HttpClient` and `WebsocketClient` from `cosmjs`, adding the necessary
queries for interacting with Namada. This may be removed in the future, as we are now using an RPC client built in Rust. For submitting IBC transactions
to a Cosmos-based source chain, we can simply reuse the RPC client from `cosmjs`.

## shared

The `shared` package contains all Rust code necessary for integrating with Namada types and functionality. _Note_ that soon much of the functionality
here will be replaced by the SDK. We will need some basic code for binding the Rust SDK with `wasm-bindgen`, but much of this will change as soon as
that is in place.

## storage

The `storage` package provides classes for interacting with different storage types in the extension and interface. This includes wrappers to handle `get` and `set` for:

- `ExtensionKVStore`
- `IndexedDBKVStore`
- `LocalKVStore`

Additionally, there is a helper class, `Store`, which simplifies interacting with `IndexedDB`, as well as simplified querying of the key-value store.

## types

All of the public types across the interface and extension should be defined here. This is important if a third-party wishes to integrate with the extension,
as it provides type definitions that can be used to improve the developer experience when integrating with the API.

In additional to `TypeScript` definitions, there are also schema definitions for `borsh`-encoded serialized data that is passed between the extension and interface.

## utils

This is a simple package that contains any reusable functionality that may be of use across the interface, extension, and other shared packages. This includes helpers,
theme definitions for the interface, wasm file loader, and async-related utilities.

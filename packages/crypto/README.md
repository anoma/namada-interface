# crypto

The `@anoma/crypto` package is to provide crytography functions with Rust via WebAssembly.

The Rust source code lives in `lib/`, and currently provides the following modules:

- `AEAD` - provides encryption of data (and of plain strings) using the `orion` crate
- `Bip44` - provides key-derivation functionality using BIP44 paths and a seed
- `Mnemonic` - provides BIP39 Mnemonic functionality to generate a mnemonic seed

## Basic usage

### Building

From the base `crypto` directory, we can build to wasm targets using the following:

```bash
# Install wasm-bindgen-cli
cargo install -f wasm-bindgen-cli

# Build to web wasm target
yarn wasm:build

# Build to NodeJS wasm target (for testing)
yarn wasm:build:node
```

### Testing

From `lib/`, we can issue the following to run unit tests:

```bash
cargo run test

# Run tests of methods returning JsValue:
wasm-pack test --node
```

## Overview

### AEAD

```rust
let password = String::from("unhackable");
let message = String::from("My secret message");

let encrypted = AEAD::encrypt_from_string(message.clone(), password.clone());
let decrypted = AEAD::decrypt(encrypted, password).expect("Value should be decrypted");
```

### Bip44

```rust
let mnemonic = Mnemonic::new(PhraseSize::Twelve)?;
let seed = mnemonic.to_seed(None)?;
let bip44: Bip44 = Bip44::new(seed)?;
let path = "m/44'/0'/0'/0'";

// Derive an ed25519 keypair from a seed and path:
let keys = bip44.derive(String::from(path))?;
```

### Mnemonic

```rust
// Generate a new Mnemonic
let mnemonic = Mnemonic::new(PhraseSize::Twelve)?;

// Generate a Mnemonic from a phrase:
let phrase = "caught pig embody hip goose like become worry face oval manual flame \
              pizza steel viable proud eternal speed chapter sunny boat because view bullet";
let mnemonic = Mnemonic::from_phrase(phrase.into());

// Get seed from mnemonic:
let seed: [u8; 64] = mnemonic.to_seed()?;

// Get words in JsValue
let words: JsValue = mnemonic.to_words()?;
```

# crypto

The `@namada/crypto` package is to provide cryptography functionality with Rust via WebAssembly.

The Rust source code lives in `lib/`, and currently provides the following crates:

- `bip32::HDWallet` - provides key-derivation functionality using BIP32/BIP44 paths and a seed
- `bip39::Mnemonic` - provides BIP39 Mnemonic functionality to generate a mnemonic seed
- `scrypt::Scrypt` - provides password hashing for storage, and hash verification

## Basic usage

### Building

From the base `crypto` directory, we can build to wasm targets using the following:

```bash
# Build to web wasm target
yarn wasm:build

# Build to NodeJS wasm target (for testing)
yarn wasm:build:node
```

### Testing

From `lib/`, we can issue the following to run unit tests:

```bash
cargo run test
```

## Overview

### HDWallet

This provides BIP32 Key Derivation, to which we can pass BIP32 or BIP44 paths:

```rust
let mnemonic = Mnemonic::new(PhraseSize::Twelve)?;
let seed = mnemonic.to_seed(None)?;
let hd_wallet: HDWallet = HDWallet::new(seed)?;
// BIP44 path:
let path = "m/44'/0'/0'/0'";

// Derive an ed25519 keypair from a seed and path:
let keys = hd_wallet.derive(String::from(path))?;
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

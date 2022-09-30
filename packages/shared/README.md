# shared

Anoma shared library functionality, providing wasm-compability for features in `namada/shared`.

## Usage

```bash
# Install wasm-bindgen-cli
cargo install -f wasm-bindgen-cli

# Build to a wasm target (for web)
yarn wasm:build

# Build to a wasm target (for NodeJS)
yarn wasm:build:node

# Run tests

cd lib
wasm-pack test --node
```

## Overview

### Transfer

Create a transfer transaction:

**Rust**

```rust
let transfer = Transfer::new(source, target, token, amount);
let transaction = transfer.to_tx(secret, epoch, fee_amount, gas_limit, tx_code)
    .expect("Should be able to convert to transaction");
```

**TypeScript**

```ts
const transfer = new Transfer(source, target, token, amount);
const { hash, bytes } = transfer.to_tx(
  secret,
  epoch,
  feeAmount,
  gasLimit,
  txCode
);
```

### IBCTransfer

Create an IBC transfer transaction:

**Rust**

```rust
let ibc_transfer = IbcTransfer::new(source_port, source_channel, token, sender, receiver, amount);
let transaction = ibc_transfer.to_tx(secret, epoch, fee_amount, gas_limit, tx_code)
    .expect("Should be able to convert to transaction");
```

**TypeScript**

```ts
const ibcTransfer = new IbcTransfer(
  port,
  channel,
  token,
  sender,
  receiver,
  amount
);
const { hash, bytes } = ibcTransfer.to_tx(
  secret,
  epoch,
  feeAmount,
  gasLimit,
  txCode
);
```

### Account

Create an "init-account" transaction for receiving an established address from an implicit address:

**Rust**

```rust
let account = Account::new(secret, vp_code);
let transaction = account.to_tx(secret, token, epoch, fee_amount, gas_limit, tx_code)
    .expect("Should be able to convert to transaction");
```

**TypeScript**

```ts
const account = new Account(secret, vpCode);
const { hash, bytes } = account.to_tx(
  secret,
  token,
  epoch,
  feeAmount,
  gasLimit,
  txCode
);
```

# shared

Namada shared library functionality, providing wasm-compability for features in `namada/shared`.

## Usage

```bash
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

**NOTE** This library has been updated to accept tx data in the form of Borsh-encoded vectors. See
[../types/README.md](README.md) in `packages/types` for more information on their usage.

```rust
// Assume we have a Borsh-encoded message "transfer_msg" and "tx_msg", and "secret" (String):
let Transfer { tx_data } = Transfer::new(transfer_msg)
    .expect("Transfer should instantiate");
let signer = Signer::new(&tx_data);
let transaction = signer.sign(&tx_msg, secret)
    .expect("Should be able to convert to transaction");

let hash = transaction.hash();
let bytes = transaction.bytes();
```

**TypeScript**

```typescript
// Assume we have Borsh-encoded messages "transferMsg" and "txMsg", and secret (string)
const { tx_data } = new Transfer(transferMsg).to_serialized();
const signer = new Signer(tx_data );
const { hash, bytes } = signer.sign(
  txMsg
  secret,
);
```

### IBCTransfer

Create an IBC transfer transaction:

**Rust**

```rust
// Assume we have Borsh-encoded messages "ibc_transfer_msg" and "tx_msg", and "secret" (String):
let IbcTranfer { tx_data } = IbcTransfer::new(ibc_transfer_msg)
    .expect("IbcTransfer should instantiate");
let signer = Signer::new(&tx_data);
let transaction = signer.sign(tx_msg, secret)
    .expect("Should be able to sign transaction");
```

**TypeScript**

```typescript
// Assume we have Borsh-encoded messages "ibcTranferMsg" and "txMsg", and "secret" (String):
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
// Assume we have Borsh-encoded messages "account_msg" and "tx_msg", and "secret" (String):
let Account { tx_data } = Account::new(account_msg, secret);
let signer = Signer::new(&tx_data);
let transaction = signer.sign(tx_msg, secret)
    .expect("Should be able to convert to transaction");
```

**TypeScript**

```typescript
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

# Shielded Transfers In Web Client

**NOTE**: The following documentation is outdated, but included below while updated functionality which incorporates the Namada SDK is being integrated:

Shielded transfers are based on [MASP](https://github.com/anoma/masp) and allows users of Namada to performs transactions where only the recipient, sender and a holder of a viewing key can see the transactions details. It is based on the specifications defined at [Shielded execution](../../ledger/shielded-execution/masp.md).

- [Shielded Transfers In Web Client](#shielded-transfers-in-web-client)
  - [Codebase](#codebase)
  - [High level data flow in the client](#high-level-data-flow-in-the-client)
  - [Relation to MASP/Namada CLI](#relation-to-maspnamada-cli)
  - [The API](#the-api)
    - [`getMaspWeb`](#getmaspweb)
    - [`MaspWeb`](#maspweb)
      - [`generateShieldedTransaction`](#generateshieldedtransaction)
      - [`getShieldedBalance`](#getshieldedbalance)
      - [`createShieldedMasterAccount`](#createshieldedmasteraccount)
      - [`decodeTransactionWithNextTxId`](#decodetransactionwithnexttxid)
    - [Underlying Rust code](#underlying-rust-code)
      - [`create_master_shielded_account`](#create_master_shielded_account)
      - [`get_shielded_balance`](#get_shielded_balance)
      - [`create_shielded_transfer`](#create_shielded_transfer)
      - [`NodeWithNextId`](#nodewithnextid)
      - [`NodeWithNextId::decode_transaction_with_next_tx_id`](#nodewithnextiddecode_transaction_with_next_tx_id)

## Codebase

The code for interacting with the shielded transfers is split in 2 places:

- `namada-wallet` (TypeScript)
  - capturing the user interactions
  - providing user feedback
  - fetching the existing MASP transactions from the ledger
- `masp-web` (Rust)
  - generating shielded transfers
  - encrypting/decrypting data
  - utilising [MASP crate](https://github.com/anoma/masp)

```
packages
│   ├── masp-web                # MASP specific Rust code
│   ├── namada-wallet           # namada web wallet
```

## High level data flow in the client

In the current implementation whenever a user start to perform a new action relating to shielded transfers, such as creating a new transfer or retrieving of the shielded balance, the client fetches all existing shielded transfers from the ledger. In the current form this is done in a non optimal way where the already fetched past shielded transactions are not persisted in the client. They are being fetched every time and only live shortly in the memory as raw byte arrays in the form they come in from the ledger. The life time in the client is: between the fetching in the TypeScript code and then being passed and being scanned/decrypted by MASP protocol in the Rust code.

This process can be further optimized:

- Namada CLI already does caching of fetched transfers, so that logic can be ru-used by providing virtual filesystem (for example [memfs](https://github.com/streamich/memfs#readme)) implementation to Rust:
- Likely the scanning can already start parallel while the fetching is running and if a sufficient amount of notes are found in scanning the fetching could be terminated.

## Relation to MASP/Namada CLI

The feature set and logic between the CLI and the web client should be the same. There are however a few differences in how they work, they are listed here:

- When optimizing the shielded interaction. We need to fetch and persist the existing shielded transfers in the client. For this the CLI is using the file system of the operating system while the web client will either have to store that data directly to the persistence mechanism of the browser (localhost or indexedDB) or to those through a virtual filesystem that seems compliant to WASI interface.
- In the current state the network calls will have to happen from the TypeScript code outside of the Rust and WASM. So any function calls to the shielded transfer related code in Rust must accept arrays of byte arrays that contains the newly fetched shielded transfers.
- There are limitations to the system calls when querying the CPU core count in the web client, so the sub dependencies of MASP using Rayon will be limited.

## The API

The consumer should use the npm package `@anoma/masp-web` that lives next to the other packages in the `anoma-apps` monorepo. It exposes the following:

### `getMaspWeb`

- A util to return an instance of `MaspWeb` and ensure it is initiated. It it was retrieved and initiated earlier the existing instance is returned.

```ts
async (): Promise<MaspWeb>
```

### `MaspWeb`

- this contains the methods to perform the shielded transaction related activities.
- the is a utility method `getMaspWeb()` exported that returns an instance of `MaspWeb` and ensures it is instantiated.

The class exposes the following methods:

#### `generateShieldedTransaction`

```ts
generateShieldedTransaction = async (
    nodesWithNextId: NodeWithNextId[],
    amount: bigint,
    inputAddress: string | undefined,
    outputAddress: string,
    transactionConfiguration: TransactionConfiguration
  ): Promise<Uint8Array>
```

#### `getShieldedBalance`

```ts
getShieldedBalance = async (
    nodesWithNextId: NodeWithNextId[],
    inputAddress: string,
    transactionConfiguration: TransactionConfiguration
  ): Promise<string>
```

#### `createShieldedMasterAccount`

- needs to add the return type to reflect derived from Rust `packages/masp-web/lib/src/shielded_account/mod.rs:ShieldedAccount`

```ts
createShieldedMasterAccount = (
    alias: string,
    seedPhrase: string,
    password?: string
): any

// the return type if from Rust code
// packages/masp-web/lib/src/shielded_account/mod.rs:ShieldedAccount
//
// pub struct ShieldedAccount {
//     viewing_key: String,
//     spending_key: String,
//     payment_address: String,
// }
```

#### `decodeTransactionWithNextTxId`

- Utility that decodes the fetched shielded transactions from the ledger and returns in format that contains the shielded transaction and the id for fetching the next one.

```ts
decodeTransactionWithNextTxId = (byteArray: Uint8Array): NodeWithNextId

type NodeWithNextId = {
  node: Uint8Array;
  nextTransactionId: string;
};
```

The above is wrapping the below described Rust API, which is not intended to be used independently at the moment.

### Underlying Rust code

currently the `masp-web` exposes the following API

#### `create_master_shielded_account`

```rust
* creates a shielded master account
* takes an optional password
pub fn create_master_shielded_account(
    alias: String,
    seed_phrase: String,
    password: Option<String>,
) -> JsValue
```

#### `get_shielded_balance`

- returns a shielded balance for a `spending_key_as_string` `token_address` pair
- requires the past transfers as an input

```rust
pub fn get_shielded_balance(
    shielded_transactions: JsValue,
    spending_key_as_string: String,
    token_address: String,
) -> Option<u64>
```

#### `create_shielded_transfer`

- returns a shielded transfer, based on the passed in data
- requires the past transfers as an input

```rust
pub fn create_shielded_transfer(
    shielded_transactions: JsValue,
    spending_key_as_string: Option<String>,
    payment_address_as_string: String,
    token_address: String,
    amount: u64,
    spend_param_bytes: &[u8],
    output_param_bytes: &[u8],
) -> Option<Vec<u8>>
```

#### `NodeWithNextId`

- This is a utility type that is used when the TypeScript code is fetching the existing shielded transfers and extracting the id of the next shielded transfer to be fetched. The returned data from ledger is turned to this type, so that the TypeScript can read the id of the next transfer and fetch it.

```rust
pub struct NodeWithNextId {
    pub(crate) node: Option<Vec<u8>>,
    pub(crate) next_transaction_id: Option<String>,
}
```

#### `NodeWithNextId::decode_transaction_with_next_tx_id`

- accepts the raw byte array returned from the ledger when fetching for shielded transfers and returns `NodeWithNextId` as `JsValue`

```rust
pub fn decode_transaction_with_next_tx_id(transfer_as_byte_array: &[u8]) -> JsValue
```

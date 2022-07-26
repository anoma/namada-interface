# anoma-lib

## Table of Contents

- [anoma-lib](#anoma-lib)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Development](#development)
  - [Notes](#notes)

## Usage

This is the Rust source code for generating WebAssembly. To build this source directly, you can use a command similar to the following:

```bash
# Example from within namada-interface/anoma-wallet
wasm-pack build ../anoma-lib/ --out-dir ../anoma-wallet/src/lib/anoma --out-name anoma --target web
```

Which, in this case, generates the `src/lib/anoma` library required by the `src/lib/Anoma`. This class file serves as a simple interface to the generated wasm, exposing types, methods, and memory access, as well as giving us an easy, centralized way to initialize it.

[ [Table of Contents](#table-of-contents) ]

## Development

The main purpose of using wasm within our web apps is to give us access to the types defined in [anoma](https://github.com/anoma/anoma), and gives us access to wasm-compatible features. Presently, we are wrapping the following types:

- `Address`
- `Keypair`
- `Tx`
- `WrapperTx`

The `Tx::new` method from `anoma` makes a call to generate a timestamp, which is incompatible with the wasm runtime in the browser (you will see `time is undefined`, or something similar, and this will cause a panic). A new `proto::Tx` struct is now created with the timestamp using `js_sys::Date`, which uses the browser's JS engine instead. This is an example of wrapping `anoma` functionality for wasm-compatibility.

In general, we should probably make use of the following conventions:

- Any "type" that needs to be wrapped can live here (I'm using the same naming convention as the original, and we should probably keeps these consistent so these are easy to reason about):
  ```bash
  src/
  ├── lib.rs
  ├── transfer.rs         # Constructs a transfer transaction
  ├── types
  │   ├── address.rs      # Wraps an anoma type
  │   ├── keypair.rs      # Wraps an anoma type
  │   ├── mod.rs
  │   ├── transaction.rs  # Generic transaction type
  │   ├── tx.rs           # Wraps an anoma type
  │   └── wrapper.rs      # Wraps an anoma type
  └── utils.rs
  ```
- We can then create a top-level type with functionality, and serialize it to something easy to parse on the front-end. For example, we can create our own `Transfer` type in `transfer.rs`, which constructs a transfer transaction and returns the final result in a tuple containing the `hash` and the `bytes` of the signed transaction. `transfer.rs` currently contains the logic for constructing this type of transaction (`token::Transfer`), but we can easily add others that follow the same principle, such as `init-account.rs`, `withdraw.rs`, etc. The similarities between transactions has been abstracted out into `types/transaction.rs`, which is a generic transaction accepting a `keypair`, `tx_code`, `data`, `token`, etc., from which to construct, wrap and sign a transaction (`proto::Tx` and `types::transaction::WrapperTx`).
- Note that the `Keypair` and `Address` structs also bind wasm functionality that are useful on their own, outside of transactions (such as serialization from a JS object, `generate_mnemonic`, address from keypair, etc).
- Of course, this can be expanded to suit our needs, and doesn't necessarily need to serve only as an interface to `anoma`. We can put any wasm-related functionality here to share with any of our web/app projects.

[ [Table of Contents](#table-of-contents) ]

## Notes

The current version of this project imports `anoma` `v0.4.0` as a dependency:

Source: https://github.com/anoma/anoma

Release: https://github.com/anoma/anoma/releases/tag/v0.4.0

[ [Table of Contents](#table-of-contents) ]

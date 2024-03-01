# @namada/sdk specs

The `@namada/sdk` package is a wrapper library to provides an easy way to integrate with the `@namada/shared` WebAssembly Rust library.

View the [API](./api.md) docs for specific information on API interfaces.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Keys](#keys)
- [Rpc](#rpc)
- [Tx](#tx)
- [Ledger](#ledger)
- [Masp](#masp)
- [Mnemonic](#mnemonic)
- [Signing](#signing)

## Basic Usage

The initialization of the `Sdk` must happen asynchronously for web applications.

In your application, you can initialize the Sdk with the following:

```typescript
import { Sdk } from "@namada/sdk";

async function myApp() {
  const rpcUrl = "http://localhost:27657";

  // You can use deconstruction to access submodules
  const { tx, keys, signing, mnemonic, keys } = await Sdk.init(rpcUrl);

  // .....
}

myApp();
```

Alternatively, you can import the `initAsync` function, which will also return an instance of the SDK:

```typescript
import { initAsync } from "@namada/sdk";

async function myApp() {
  const rpcUrl = "http://localhost:27657";
  const sdk = await initAsync(rpcUrl);
}

myApp();
```

[ [Table of Contents](#table-of-contents) ]

## Keys

This module contains the functionality to generate transparent and shielded keys for Namada.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Rpc

This module contains RPC queries for interacting with the chain, as well as Tx broadcasting.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Tx

This module contains functionality for building and signing transactions.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Ledger

This class provides functionality for interacting with `NamadaApp` for the Ledger Hardware Wallet.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Masp

This module provides a few basic utilities for handling `Masp` params, as well as adding spending keys to the
wallet context.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Mnemonic

This provides basic funcitonality for generating 12 or 24 word mnemonics, validating mnemonics, and generating
seeds from mnemonics.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

## Signing

This class provides the functionality from our Rust library for signing and verifying arbitrary data.

More info _TBD_

[ [Table of Contents](#table-of-contents) ]

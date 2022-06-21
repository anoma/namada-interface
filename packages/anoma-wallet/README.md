# anoma-wallet

This subdirectory of the `anoma-apps` repo contains the React app for `anoma-wallet`.

## Table of Contents

- [Usage](#usage)
- [Overview](#overview)
- [Vocabulary](#vocabulary)
- [Low Level Functionality](#functionality)
- [Security Requirements](#requirements)
- [Adversarial Model](#model)
- [Approach](#approach)
- [Workflow](#workflow)

## Usage

```bash
# Install dependencies
yarn install

# Start app in development mode
yarn dev

# Start app in development mode, specifying a `REACT_APP_LOCAL`
# environment variable (useful for switching defaults between a local
# ledger and a testnet):
yarn dev:local

# Build production release:
yarn build

# Run ESLint
yarn lint

# Run ESLint fix
yarn lint:fix

# Run tests
yarn test

# OTHER

# Build wasm library with web target
yarn wasm:build

# Build wasm library with nodejs target
yarn wasm:build:nodejs
```

[ [Table of Contents](#table-of-contents) ]

## Overview

```bash
# Directory structure rough outline for anoma-wallet
./src
├── App                   # Main React app and layouts
├── components            # React Components
├── constants
│   ├── tokens.ts         # Token addresses
│   ├── tx.ts             # TxResponse events
│   └── wasm.ts           # Wasm source constants
├── lib
│   ├── rpc
│   │   ├── RpcClient.ts    # RPC HTTP library
│   │   ├── SocketClient.ts # RPC WebSocket library
│   │   └── types.ts        # RPC Request/Response types
│   ├── tx
│   │   ├── Transfer.ts   # Transfer transaction library
│   │   └── Account.ts    # Account transaction library
│   ├── Keypair.ts        # Keypair library
│   └── Wallet.ts         # Wallet library
├── schema                # Borsh schema for deserializing abci_query types
└── utils
    ├── helpers           # Utility helper functions
    └── theme             # Theme utilities
```

## Vocabulary/ Notations
* Seed phrase: ```seed```
* password: ```pwd```
* symmetric encryption/decryption (AES) key: ```ek```
* master private/public wallet signing keys: ```msk,mpk```

## Low Level Functionality:

```
Wallet.createMSK(rnd)->msk,mpv:
```
* takes as input rnd and creates msk and mpv. Where msk is stored?

```
Wallet.createKey(msk,mpv,seed,tag)->sk,pk:
```
* takes as input msk,mpv,seed,tag and outputs a new sk,pk


```
Wallet.issueTransaction(tx,sk)->s:
```
* takes as input tx data and sk and outputs a signed transation **s** to be sent to the ledger for verification

## Security Requirements:

1. SR1: Unauthorized access to `msk,password,seed` and `sk's` should be prevented
2. SR2: traffic between wallet<>ledger should be e2e encrypted to precent eavesdroppers.

## Adversarial Model:
1. An adversary is allowed to watch all traffic between the wallet and the ledger
2. Secret information stored at user's side is assumed to be secret(`seed`,`pwd`)

## Approach:
1. For SR1 encrypt everything on the disk (where the wallet is) with a symmetric disk storage encryption primitive.
2. For SR2 encrypt end to end with the ledger with a scheme providing confidentiality and integrity. PKI is needed or hardcoded public keys of the ledger to negotiate secret symmetric keys for to e2e encypt traffic. Is TLS sufficient here, where wallet acts as a web-client and ledger as the server?



## Workflows:
* **RegisterUser(`pwd,seed`)->`c_seed,c_state`**:
    * User: sets up `pwd` and `seed`
    * Wallet:`kdf(pwd) = ek` //Derive the AES encryption key
    * Wallet:`AES(ek,seed) = c_seed` //Encrypt with the encryption key the seed
    * Wallet: Store `c_seed` on disk //Store on disk the ciphertext
    * Wallet: sets a global counter `cnt`= 0
    * Wallet: Computes `state = msk,mpk,cnt`
    * Wallet: Encrypts `AES(ek,state) = c_state`
    * Wallet: Delete `ek` from memory and disk
* **CreateAccount(`pwd,alias`)->`sk,pk`**:
    * User: enters password `pwd`
    * Wallet: `kdf(pwd)=ek'`
    * Wallet: If `AES_Decrypt(ek', c_seed)==OK` success `else` error
    * User enters alias `alias`
    * Wallet: `AES_Decrypt(ek', c_state) = state`
    * Wallet: Fetch `msk,mpk,cnt` from `state`
    * Wallet: `cnt=cnt+1`
    * Wallet: `KeyDerivation(msk,mpk,cnt,alias) = sk,pk`

* **LogIn(`pwd`)->(`Success/Error`)**:
    * User: enters password `pwd`
    * Wallet: If `AES_Decrypt(kdf(pwd)', c_seed)==OK` success `else` error
* **Transact**(`tx,c_seed,c_state,sk`)->$\sigma$:
    * User: enters password `pwd`
    * Wallet: `kdf(pwd)=ek'`
    * Wallet: If `AES_Decrypt(ek', c_seed)==OK` success `else` error
     * Wallet:  `Sign(sk,tx)=`$\sigma$




[ [Table of Contents](#table-of-contents) ]

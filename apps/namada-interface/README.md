# namada-interface/interface

This subdirectory of the `namada-interface` repo contains the React app for `interface`.

## Table of Contents

- [interface](#interface)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Configuration](#configuration)
    - [Configure a single local ledger](#configure-a-single-local-ledger)
    - [Configure with two IBC-enabled chains](#configure-with-two-ibc-enabled-chains)
  - [Overview](#overview)
  - [Vocabulary/ Notations](#vocabulary-notations)
  - [Low Level Functionality:](#low-level-functionality)
  - [Security Requirements:](#security-requirements)
  - [Adversarial Model:](#adversarial-model)
  - [Approach:](#approach)
  - [Workflows:](#workflows)

## Interface

### Usage

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
```

[ [Table of Contents](#table-of-contents) ]

### Configuration

There are two ways to configure the app to work with a local (or development) environment - with a single ledger, or with two IBC-enabled validators.
These options are added to a `.env` environment. See [.env.sample](https://github.com/anoma/namada-interface/blob/main/apps/interface/.env.sample) for the full list
of options.

#### Configure a single local ledger

By default, running the wallet in local-development mode (`yarn dev:local`), will connect to a local ledger running at `http://127.0.0.1:26657`. To override this setting,
the following options are available:

```bash
REACT_APP_LOCAL_LEDGER_CHAIN_ID=anoma-test.fd58c789bc11e6c6392
REACT_APP_LOCAL_LEDGER_URL=172.0.00.123
REACT_APP_LOCAL_LEDGER_PORT=27657
REACT_APP_LOCAL_FAUCET=atest1v4ehgw36gfprwdekgg6rsdesg3rry3pjx9prqv3exumrg3zzx3q5vv3nx4zr2v6yggurgwp4rzjk2v
```

Specifying a `REACT_APP_LOCAL_FAUCET` will inform the app to fund any new accounts with 1000 of the selected token for that account.

#### Configure with two IBC-enabled chains

We can configure the app to work with two chains, both with IBC enabled (assuming they have a channel established with an IBC relayer):

```bash
# CHAIN A - Default Chain
REACT_APP_CHAIN_A_ALIAS=Anoma Fractal Instance - 1 # OPTIONAL - Defaults to "IBC - 1"
REACT_APP_CHAIN_A_ID=anoma-test.1e670ba91369ec891fc # REQUIRED
REACT_APP_CHAIN_A_URL=10.0.1.123 # OPTIONAL - Defaults to 127.0.0.1
REACT_APP_CHAIN_A_PORT=27657 # OPTIONAL - Defaults to 27657
REACT_APP_CHAIN_A_FAUCET=atest1v4ehgw36gfprwdekgg6rsdesg3rry3pjx9prqv3exumrg3zzx3q5vv3nx4zr2v6yggurgwp4rzjk2v

# CHAIN B
REACT_APP_CHAIN_B_ALIAS=Anoma Fractal Instance - 2 # OPTIONAL - Defaults to "IBC - 2"
REACT_APP_CHAIN_B_ID=anoma-test.89060614ce340f4baae # REQUIRED
REACT_APP_CHAIN_B_URL=10.0.1.123 # OPTIONAL - Defaults to 127.0.0.1
REACT_APP_CHAIN_B_PORT=28657 # OPTIONAL - Defaults to 28657
REACT_APP_CHAIN_B_FAUCET=atest1v4ehgw36xscyvdpcxgenvdf3x5c523j98pqnz3fjgfq5yvp4xpqnvv69x5erzvjzgse5yd3suq5pd0
```

At a bare minimum, we need to specify a unique chain ID for each IBC chain. Omitting the other values will default to connecting to two localhost chains on ports `27657` and `28657`.

See [IBC Testing Setup](https://hackmd.io/vCawBZZYQYGRxZXeMgIqGw?view) for more information on configuring the Hermes IBC relayer with two Namada chains.

[ [Table of Contents](#table-of-contents) ]

## Overview

```bash
# Directory structure rough outline for interface
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

- Seed phrase: `seed`
- password: `pwd`
- symmetric encryption/decryption (AES) key: `ek`
- master private/public wallet signing keys: `msk,mpk`

## Low Level Functionality:

```
Wallet.createMSK(rnd)->msk,mpv:
```

- takes as input rnd and creates msk and mpv. Where msk is stored?

```
Wallet.createKey(msk,mpv,seed,tag)->sk,pk:
```

- takes as input msk,mpv,seed,tag and outputs a new sk,pk

```
Wallet.issueTransaction(tx,sk)->s:
```

- takes as input tx data and sk and outputs a signed transation **s** to be sent to the ledger for verification

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

- **RegisterUser(`pwd,seed`)->`c_seed,c_state`**:
  - User: sets up `pwd` and `seed`
  - Wallet:`kdf(pwd) = ek` //Derive the AES encryption key
  - Wallet:`AES(ek,seed) = c_seed` //Encrypt with the encryption key the seed
  - Wallet: Store `c_seed` on disk //Store on disk the ciphertext
  - Wallet: sets a global counter `cnt`= 0
  - Wallet: Computes `state = msk,mpk,cnt`
  - Wallet: Encrypts `AES(ek,state) = c_state`
  - Wallet: Delete `ek` from memory and disk
- **CreateAccount(`pwd,alias`)->`sk,pk`**:

  - User: enters password `pwd`
  - Wallet: `kdf(pwd)=ek'`
  - Wallet: If `AES_Decrypt(ek', c_seed)==OK` success `else` error
  - User enters alias `alias`
  - Wallet: `AES_Decrypt(ek', c_state) = state`
  - Wallet: Fetch `msk,mpk,cnt` from `state`
  - Wallet: `cnt=cnt+1`
  - Wallet: `KeyDerivation(msk,mpk,cnt,alias) = sk,pk`

- **LogIn(`pwd`)->(`Success/Error`)**:
  - User: enters password `pwd`
  - Wallet: If `AES_Decrypt(kdf(pwd)', c_seed)==OK` success `else` error
- **Transact**(`tx,c_seed,c_state,sk`)->$\sigma$:
  - User: enters password `pwd`
  - Wallet: `kdf(pwd)=ek'`
  - Wallet: If `AES_Decrypt(ek', c_seed)==OK` success `else` error
  - Wallet: `Sign(sk,tx)=`$\sigma$

[ [Table of Contents](#table-of-contents) ]

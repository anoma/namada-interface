# anoma-wallet

This subdirectory of the `anoma-apps` repo contains the React app for `anoma-wallet`.

## Table of Contents

- [Usage](#usage)
- [Overview](#overview)

## Usage

```bash
# Install dependencies
yarn install

# Build wasm library dependency (this is required before running the app)
yarn wasm:build

# Start app in development mode
yarn start

# Start app in development mode, specifying a `REACT_APP_LOCAL`
# environment variable (useful for switching defaults between a local
# ledger and a testnet):
yarn start:local

# Build production release:
yarn build
```

[ [Table of Contents](#table-of-contents) ]

## Overview

```bash
# Directory structure rough outline for anoma-wallet/src:
.
├── App                   # Main React app and layouts
├── components            # React Components
├── constants
│   ├── tokens.ts         # Token addresses
│   ├── tx.ts             # TxResponse events
│   └── wasm.ts           # Wasm source constants
├── lib
│   ├── AnomaClient.ts    # Main interface to anoma wasm library
│   ├── anoma             # Wasm-generated source
│   ├── rpc
│   │   ├── RpcClient.ts  # RPC HTTP and WebSocket library
│   │   ├── types.ts      # RPC Request/Response types
│   └── tx
│       └── Transfer.ts   # Transfer transaction library
├── schema                # Borsh schema for deserializing abci_query types
└── utils
    ├── helpers           # Utility helper functions
    └── theme             # Theme utilities
```

[ [Table of Contents](#table-of-contents) ]

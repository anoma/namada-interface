# anoma-wallet

This subdirectory of the `anoma-apps` repo contains the React app for `anoma-wallet`.

## Table of Contents

- [Usage](#usage)
- [Overview](#overview)

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
# Directory structure rough outline for anoma-apps monorepo
.
├── App                   # Main React app and layouts
├── components            # React Components
├── constants
│   ├── tokens.ts         # Token addresses
│   ├── tx.ts             # TxResponse events
│   └── wasm.ts           # Wasm source constants
├── lib
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

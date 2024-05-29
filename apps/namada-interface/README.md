# namada-interface

This is the React app for `namada-interface`, the web client which integrates with the Namada `extension`.

## Table of Contents

- [Usage](#usage)
- [Configuration](#configuration)

### Usage

```bash
# Install dependencies
yarn

# Build wasm-dependencies (for using SDK Query)
yarn wasm:build

# Build wasm-dependencies with debugging enabled
yarn wasm:build:dev

# Start app in development mode
yarn dev:local

# If you are running chains locally, it is recommended that you instead proxy RPC requests:
yarn dev:proxy

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

Configuration is done by creating a `.env` file, based on [.env.sample](./.env.sample), and specifying the values you wish to override.

The following is an example of configuring the interface and extension to connect to testnets:

```bash
# NAMADA
NAMADA_INTERFACE_NAMADA_ALIAS=Namada Testnet
NAMADA_INTERFACE_NAMADA_CHAIN_ID=public-testnet-14.5d79b6958580
NAMADA_INTERFACE_NAMADA_URL=https://proxy.heliax.click/public-testnet-14.5d79b6958580/

# COSMOS
NAMADA_INTERFACE_COSMOS_ALIAS=Cosmos Testnet
NAMADA_INTERFACE_COSMOS_CHAIN_ID=theta-testnet-001
NAMADA_INTERFACE_COSMOS_URL=https://rpc.sentry-01.theta-testnet.polypore.xyz

# ETH
NAMADA_INTERFACE_ETH_ALIAS=Eth Testnet
NAMADA_INTERFACE_ETH_CHAIN_ID=0x7A69
NAMADA_INTERFACE_ETH_URL=https://rpc.ankr.com/eth_goerli
```

For more details on setting up your local environment for integration between the interface and the extension, see the [README.md](../../README.md) at the root of this repo.

[ [Table of Contents](#table-of-contents) ]

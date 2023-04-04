# namada-interface/interface

## Table of Contents

- [interface](#interface)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
  - [Configuration](#configuration)

## Interface

### Usage

```bash
# Install dependencies
yarn
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
# NAMADA
REACT_APP_NAMADA_ALIAS=Namada Testnet
REACT_APP_NAMADA_CHAIN_ID=namada-1.5.32ccad5356012a7
REACT_APP_NAMADA_URL=http://127.0.0.1:26657
REACT_APP_NAMADA_BECH32_PREFIX=atest

# COSMOS
REACT_APP_COSMOS_ALIAS=Cosmos Testnet
REACT_APP_COSMOS_CHAIN_ID=cosmos-testnet.123412341234
REACT_APP_COSMOS_URL=http://127.0.0.1:12345

```

[ [Table of Contents](#table-of-contents) ]

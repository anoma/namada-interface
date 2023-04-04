# namada-interface/interface

## Table of Contents

- [Usage](#usage)
- [Configuration](#configuration)
- [Configure a local node](#configure-a-local-node)

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

Variables can be overridden in a `.env` file within `apps/namada-interface`. See [.env.sample](https://github.com/anoma/namada-interface/blob/main/apps/interface/.env.sample) for the full list
of options.

By default, running the wallet in local-development mode (`yarn dev:local`), will connect to a devnet ledger. To override this setting to connect to
a local ledger, the following options are available:

```bash
# NAMADA
REACT_APP_NAMADA_ALIAS=Local Testnet
REACT_APP_NAMADA_CHAIN_ID=local-1.5.32ccad5356012a7
REACT_APP_NAMADA_URL=http://127.0.0.1:26657
REACT_APP_NAMADA_BECH32_PREFIX=atest

# COSMOS - If testing with a local Cosmos testnet (Gaia)
REACT_APP_COSMOS_ALIAS=Cosmos Testnet
REACT_APP_COSMOS_CHAIN_ID=cosmos-testnet.123412341234
REACT_APP_COSMOS_URL=http://127.0.0.1:12345
```

[ [Table of Contents](#table-of-contents) ]

#### Configure a local node

- Clone the [namada](https://github.com/anoma/namada) repository
- In `namada/`, build namada and wasm scripts:
  ```
  ./scripts/get_tendermint.sh
  make build
  make build-wasm-scripts
  ```
- Initilize network
  ```
  target/debug/namadac utils init-network \
    --genesis-path genesis/e2e-tests-single-node.toml \
    --wasm-checksums-path wasm/checksums.json \
    --chain-prefix local \
    --unsafe-dont-encrypt \
    --localhost \
    --allow-duplicate-ip
  ```
- Setup validator

  ```
  CHAIN_ID=$1

  cp -f wasm/checksums.json .anoma/${CHAIN_ID}/setup/validator-0/.anoma/${CHAIN*ID}/wasm/
  cp -f wasm/*.wasm .anoma/${CHAIN_ID}/setup/validator-0/.anoma/${CHAIN*ID}/wasm/
  cp -f wasm/checksums.json .anoma/${CHAIN_ID}/wasm/
  cp -f wasm/*.wasm .anoma/${CHAIN_ID}/wasm/
  ```

- Start ledger with validator node
  ```
  target/debug/namadan --chain-id ${CHAIN_ID} --base-dir .anoma/${CHAIN_ID}/setup/validator-0/.anoma --mode validator ledger
  ```
- Setup wallet
  ```
  target/debug/namada wallet address gen --alias my-account
  ```
- Send a transfer from faucet
  ```
  target/debug/namada client transfer \
   --source faucet \
   --target ${ADDRESS} \
   --token NAM \
   --amount 100 --ledger-address tcp://127.0.0.1:27657 --signer my-account
  ```
- To prevent the CORS bad request issue:
  1.  Start node
  2.  Stop node
  3.  Go to `.namada/${CHAIN_ID}/setup/validator/.namada/${CHAIN_ID}/tendermint/config/config.toml`
  4.  set `cors_allowed_origins = ["*"]`
  5.  Start node again

[ [Table of Contents](#table-of-contents) ]

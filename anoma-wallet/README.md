# anoma-wallet

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

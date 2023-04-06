# packages/shared

Shared library functionality, providing wasm-compability for the Namada SDK.

## Usage

```bash
# Install wasm-bindgen-cli
cargo install -f wasm-bindgen-cli

# Build to a wasm target (for web)
yarn wasm:build

# Build to a wasm target (for NodeJS)
yarn wasm:build:node

# Run tests

cd lib
wasm-pack test --node
```

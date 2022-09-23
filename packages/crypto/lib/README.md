# crypto lib

Rust library for compiling crypto functions to wasm, as used by Namada Interface and the wallet extension.

## Usage

```bash
# Install wasm-bindgen-cli
cargo install -f wasm-bindgen-cli

# Build wasm
../scripts/build.sh

# Build wasm to a NodeJS target (for testing)
../scripts/build-test.sh
```

## Testing

```bash
cargo test

# Test wasm-specific features
wasm-pack test --node
```

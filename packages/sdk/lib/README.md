# SDK lib

Rust library for wrapping Namada types and functionality and compiling to wasm, as used by Namadillo and Namada Keychain.

## Usage

```bash
# Install wasm-bindgen-cli
cargo install -f wasm-bindgen-cli

# TODO: Fix the following!

# Build wasm
node ./scripts/build.js --multicore --release

# Build wasm to a NodeJS target (for testing)
node ./scripts/build.js --target node
```

## Testing

```bash
cargo test

# Test wasm-specific features
wasm-pack test --node
```

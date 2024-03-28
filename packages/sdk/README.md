# sdk

Namada SDK package

## Note
SDK will change frequently and changes may not be backward compatible. Sorry for that!
NodeJS support is "experimental", in the sense that it is not used by us in any of our projects(yet).
If you are missing some of the features, please open an [issue](https://github.com/anoma/namada-interface/issues).

## Development

```bash
# Build wasm for single core, release mode
yarn wasm:build[:node]

# Build wasm for multicore, release mode
yarn wasm:build[:node]:multicore

# Build wasm with debugging for single core
yarn wasm:build[:node]:dev

# Build wasm with debugging for multicore
yarn wasm:build[:node]:dev:multicore
```

## Usage

See [namada-sdkjs-examples](https://github.com/anoma/namada-sdkjs-examples)

For more information, read the [API](./docs/api.md) documentation.

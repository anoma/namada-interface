# NOTICE FOR FIREFOX ADD-ON REVIEWERS

This is the monorepo which contains the source code for Namada Extension.

## Source code

The main extension source code is located in `apps/extension/src`. We also use
several local packages; their sources are in:

- `packages/chains/src`
- `packages/components/src`
- `packages/hooks/src`
- `packages/sdk/src`
- `packages/storage/src`
- `packages/types/src`
- `packages/utils/src`
- `packages/shared/lib` (shared package Rust code compiled to WebAssembly)
- `packages/shared/src` (shared package TypeScript glue code)
- `packages/crypto/lib` (crypto package Rust code compiled to WebAssembly)
- `packages/crypto/src` (crypto package TypeScript glue code)

## Build instructions

These instructions should work for the default reviewer build environment.

```bash
sudo apt install protobuf-compiler build-essential
curl https://sh.rustup.rs -sSf | sh
npm install -g yarn
export PUPPETEER_SKIP_DOWNLOAD=true
yarn
cd apps/extension
yarn wasm:build
```

Before building the extension, you must specify the following value in a `.env` file in `apps/extension`:

```bash
NAMADA_INTERFACE_NAMADA_CHAIN_ID=internal-devnet-43.d9368f80c60
```

Then, issue the final build command for the Firefox add-on:

```bash
yarn build:firefox
```

The resulting extension is the ZIP file in `apps/extension/build/firefox`.

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

If you don't already have Node v20 LTS and NPM v10, install now via `nvm`:

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Enable nvm in current shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install v20 LTS
nvm install v20.9.0
```

These instructions should work for the default reviewer build environment.

```bash
sudo apt install protobuf-compiler build-essential curl pkg-config libssl-dev binaryen
curl https://sh.rustup.rs -sSf | sh

# Proceed with standard installation when prompted

# Make sure to pull cargo into your current environment:
. "$HOME/.cargo/env"

npm install -g yarn
export PUPPETEER_SKIP_DOWNLOAD=true
yarn
cd apps/extension
yarn wasm:build
```

Then, issue the final build command for the Firefox add-on:

```bash
yarn build:firefox
```

The resulting extension is the ZIP file in `apps/extension/build/firefox`.

# NOTICE FOR FIREFOX ADD-ON REVIEWERS

This is the monorepo which contains the source code for Namada Extension. Please follow the instructions
exactly as they are described below.

## Table of Contents

- [Build Instructions](#build-instructions)
- [Notes](#notes)
  - [Environment](#environment)
  - [Setting up Node & NPM](#setting-up-node-and-npm)
  - [Source Code](#source-code)

## Build instructions

**NOTE**: You _must_ use `yarn` to install dependencies! This is due to the fact that this is configured as a monorepo
using yarn workspaces. If you install via `npm install` or `npm i`, it will not resolve dependencies correctly.

If you don't already have Node v22 LTS and NPM v10, please follow these [instructions](#setting-up-node-and-npm)

These instructions should work for the default reviewer build environment.

```bash
sudo apt install protobuf-compiler build-essential curl pkg-config libssl-dev binaryen
curl https://sh.rustup.rs -sSf | sh

# Proceed with standard installation when prompted

# Make sure to pull cargo into your current environment:
. "$HOME/.cargo/env"

# You must use yarn to install dependencies:
npm install -g yarn
export PUPPETEER_SKIP_DOWNLOAD=true

# Run yarn to install dependencies
yarn

# Move into extension app directory
cd apps/extension

# Build wasm dependency:
yarn wasm:build
```

Then, issue the final build command for the Firefox add-on:

```bash
# Specify REVISION to match commit in the submitted release build:
export REVISION=487d2a1697f50f06e77677df8e081f868d2a5860

# Build the addon:
yarn build:firefox
```

The resulting extension is the ZIP file in `apps/extension/build/firefox`.

[ [Table of Contents](#table-of-contents) ]

## Notes

### Environment

This build was produced using the following environment:

- Ubuntu 24.04 LTS (Desktop edition)
- 10GB of system memory (RAM)
- 6 cores of vCPU
- Node 22 LTS and npm 10
- 35GB of storage

Please ensure that this matches your environment!

[ [Table of Contents](#table-of-contents) ]

### Setting up Node and NPM

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Enable nvm in current shell
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install v22 LTS
nvm install v22.0.0
```

[ [Table of Contents](#table-of-contents) ]

### Source code

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

[ [Table of Contents](#table-of-contents) ]

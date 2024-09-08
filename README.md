<h1> namada-interface</h1>

<div style="width: 100%; display: flex; justify-content: center; margin-bottom: 32px;">
    <img style="width: 300px;" src="banner-image.png" />
</div>

See our `specs` for more detailed documentation in [/specs](https://github.com/anoma/namada-interface/blob/main/specs)

If you would like to contribute, please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

- [Installation](#installation)
  - [Ubuntu Linux](#ubuntu)
  - [macOS](#macos)
  - [Apple Silicon](#apple-silicon)
- [Usage](#usage)
  - [Local Chain](#local-chain)
  - [Extension](#extension)
  - [Interface](#interface)
  - [Testing](#testing)
    - [Unit](#unit)
    - [e2e](#e2e)

## Installation

Before using apps in this repo, we first need to install all dependencies.

### Ubuntu

_NOTE_ These instructions may work with other Ubuntu-based systems, but are only confirmed to work in Ubuntu.

```bash
# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install clang
sudo apt-get install -y clang

# Install pkg-config
sudo apt-get install -y pkg-config

# Install openssl development packages
sudo apt-get install -y libssl-dev

# Install protoc
sudo apt-get install -y protobuf-compiler

# Install curl
sudo apt-get install -y curl

# Install npm
sudo apt-get install -y npm

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install yarn and JS dependencies
npm install -g yarn

# within namada-interface/ base folder:
yarn

# Initialize Husky
yarn prepare
```

### macOS

```bash
# Install xcode
xcode-select --install

# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install clang
brew install clang

# Install pkg-config
brew install pkg-config

# Install openssl development packages
brew install libssl-dev

# Install protoc
brew install protobuf

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install yarn and JS dependencies
npm install -g yarn

# within namada-interface/ base folder:
yarn

# Initialize Husky
yarn prepare
```

Finally, update your shell environment (e.g., in `~/.zshrc`) to set the following variables:

```
export CC=/usr/local/opt/llvm/bin/clang
AR=/usr/local/opt/llvm/bin/llvm-ar
```

#### Apple Silicon

On macOS, when using Apple Silicon architecture, in order to compile some packages for our wasm dependencies, you will need to install
the following:

```
# Mac M1/M2 only - install brew's version of llvm
brew install llvm
```

Then, in your shell profile (e.g., `~/.zshrc`), export the following environment variables:

```
# Mac M1/M2 only
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
export CC=/opt/homebrew/opt/llvm/bin/clang
export AR=/opt/homebrew/opt/llvm/bin/llvm-ar
```

## Usage

### Local chain

Before you start the extension and interface, you will need at least a chain ID, an RPC URL, and an Indexer URL. This can either be a local chain or an
existing network. If you know the chain ID and URL, you can skip the following and simply enter these values on the app interface.

- To install and run Namada locally, refer to these [instructions](https://docs.namada.net/operators/networks/local-network).
- To run a local indexer, follow these [instructions](https://github.com/anoma/namada-indexer). Ensure that the `TENDERMINT_URL` in your `.env` file points to your local RPC (default is `http://localhost:27657`) or to a public RPC.

### Extension

Within `apps/extension/`, we may issue the following commands:

```bash
# Build wasm dependencies
yarn wasm:build

# Build wasm dependencies with debugging enabled
yarn wasm:build:dev

# Run development extension for Chrome
yarn start:chrome

# Run development extension for Firefox
yarn start:firefox

# Build Chrome extension (production version)
yarn build:chrome

# Build Firefox extension (production version)
yarn build:firefox
```

#### Firefox Add-On Review

See the [FIREFOX_README.md](./apps/extension/FIREFOX_README.md) for specific instructions related to reviewing the Firefox Add-On.

### Interface

Within `apps/namadillo/`, we may issue the following commands:

```bash
# Make sure to build wasm dependencies before starting development server
yarn wasm:build

# Run development interface, hosted at http://localhost:5173
yarn dev

# Build production version
yarn build
```

There are also app-specific instructions in the [namadillo README](apps/namadillo/README.md) and the [extension README](apps/extension/README.md).

### Testing

#### Unit

At the root-level, we can issue commands for all packages in the monorepo. Following is an example:

```bash
# Execute all tests within monorepo
# Running this from the root project directory will run unit tests
# for all packages where a test script is defined
yarn test

# Lint all packages
yarn lint

# Fix linting on all packages
yarn lint:fix
```

### Storybook

Storybook provides a documentation for UI components. Within `/storybook` folder, you can install and run it using the following commands:

```bash
# Install packages
yarn

# Run Storybook interface
yarn storybook
```

To generate a static build, you can run

```bash
yarn storybook-build
```

The generated output will be available at `/storybook/storybook-static` folder.

## Audits

[Least Authority audit - 03.07.2023](audits/LeastAuthority-03-07-2023.pdf)

## License

Unless explicitly stated otherwise all files in this repository are licensed under the Apache License 2.0.

License boilerplate:

```
Copyright Anoma Foundation 2021-2023

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

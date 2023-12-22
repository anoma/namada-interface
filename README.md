<h1> namada-interface</h1>

<div style="width: 100%; display: flex; justify-content: center; margin-bottom: 32px;">
    <img style="width: 300px;" src="banner-image.png" />
</div>

See our `specs` for more detailed documentation in [/specs](https://github.com/anoma/namada-interface/blob/main/specs)

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

# Install wasm-pack
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install yarn and JS dependencies
npm install -g yarn

# within namada-interface/ base folder:
yarn

# Install web-ext
yarn global add web-ext

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

# Install web-ext
yarn global add web-ext

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

Before you start the extension and interface, you will need at least a chain ID and an RPC URL. This can either be a local chain or an
existing network. If you know the chain ID and URL, you can skip the following and simply enter these values in the `apps/namada-interface/.env`
file (to see an example of the values you can set, see [.env.sample](./apps/namada-interface/.env.sample).)

To build and run the chain locally, you will need to clone <http://github.com/anoma/namada>.

1. In `namada/`, first run `make build`, then `make install`
2. Initialize a local chain with:

   ```bash
   namadac utils init-network --genesis-path genesis/e2e-tests-single-node.toml --wasm-checksums-path wasm/checksums.json --chain-prefix local --unsafe-dont-encrypt --localhost --allow-duplicate-ip
   ```

   Make note of the chain ID from this output! This will be used below where `{CHAIN_ID}` is denoted (replace these instances
   with the actual chain ID). 3. To transfer funds from faucet via the CLI, you will need to create a wallet:

   ```bash
   namadaw key gen --alias my-key
   ```

3. Before running the chain, you will need to change one configuration file:
   - On Linux: Edit `~/.local/share/namada/{CHAIN_ID}/setup/validator-0/.namada/{CHAIN_ID}/config.toml`
   - On macOS: Edit `~/Library/Application\ Support/Namada/{CHAIN_ID}/setup/validator-0/.namada/{CHAIN_ID}/config.toml`
4. In `config.toml`, change the line `cors_allowed_origins = []` to `cors_allowed_origins = ["*"]`, then save and close.
5. You can now start the local chain

   - On Linux:

   ```bash
   namadan --chain-id {CHAIN_ID} --base-dir ~/.local/share/Namada/{CHAIN_ID}/setup/validator-0/.namada ledger run
   ```

   - On macOS:

   ```bash
   namadan --chain-id {CHAIN_ID} --base-dir ~/Library/Application\ Support/Namada/{CHAIN_ID}/setup/validator-0/.namada ledger run
   ```

6. Edit the following value in `namada-interface/apps/namada-interface/.env` (remember to replace `{CHAIN_ID}`
   with the actual chain ID from above):

   ```bash
   NAMADA_INTERFACE_NAMADA_CHAIN_ID={CHAIN_ID}
   NAMADA_INTERFACE_NAMADA_URL=http://127.0.0.1:27657/
   ```

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

### Interface

Within `apps/namada-interface/`, we may issue the following commands:

```bash
# Make sure to build wasm dependencies before starting development server
yarn wasm:build

# Run development interface, hosted at http://localhost:3000
yarn dev:local

# Build production version
yarn build
```

There are also app-specific instructions in the [namada-interface README](apps/namada-interface/README.md) and the [extension README](apps/extension/README.md).

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

#### e2e

TBA

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

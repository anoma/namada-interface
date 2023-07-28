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

### Extension

Within `apps/extension/`, we may issue the following commands:

```bash
# Build wasm dependencies
yarn build:wasm

# Build wasm dependencies with debugging enabled
yarn build:wasm:dev

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

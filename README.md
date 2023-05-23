<h1> namada-interface</h1>

<div style="width: 100%; display: flex; justify-content: center; margin-bottom: 32px;">
    <img style="width: 300px;" src="banner-image.png" />
</div>

There is a seperate more details specifications documentation under [/specs](https://github.com/anoma/namada-interface/blob/main/specs)

<h2> Run namada-interface </h2>

```bash
# go to the directory of namada-interface web app
cd apps/namada-interface

# other OS
yarn wasm:build

# on ARM based mac do this instead:
# xcode-select --install
# brew install llvm
# CC=/opt/homebrew/opt/llvm/bin/clang AR=/opt/homebrew/opt/llvm/bin/llvm-ar yarn wasm:build

yarn
yarn start
```

for solving possible issue see [Troubleshooting](#troubleshooting)

- [Introduction](#introduction)
  - [Usage](#usage)
  - [Project Structure](#project-structure)
    - [Utils / Theme](#utils--theme)
      - [Colors](#colors)
      - [Example](#example)
      - [Exceptions](#exceptions)
  - [Testing](#testing)
    - [Unit](#unit)
    - [e2e](#e2e)

## Introduction

This is the main app of the project and it is the user interface of the application. It is based on create-react-app and uses TypeScript. Some of its' functionality is split to external project living in this repository, under the directory `packages`. They are: [anoma-lib](#anoma-lib), [key-management](#key-management), [masp-web](#masp-web). All of those dependencies use Rust code that is compiled to WASM with [bindgen](https://rustwasm.github.io/wasm-bindgen). Anoma-wallet and its developers do not have to care about this fact, except when compiling the dependencies in the beginning. All of the libraries using WASM exposes a usual TypeScript interface.

This is the `namada-interface` monorepo. Within it, you will find the code for the web wallet implementation. it contains the following packages:

```bash
namada-interface/
└── apps/
    ├── namada-interface/   # Main wallet React App
    ├── extension/          # Browser Extension React App
└── packages/
    ├── crypto/          # Crypto functions related to anoma extension and interface
    ├── integrations/    # Third-party wallet integrations
    ├── masp-web/        # utilities for performing MASP actions
    ├── rpc/             # Library for handling HTTP and WebSocket RPC calls
    ├── seed-management/ # Seed management library
    ├── session/         # Session management library
    ├── shared/          # Package for interfacing with `namada/shared`
    ├── tx/              # Library for interfacing with Anoma transactions
    ├── utils/           # Shared utilities
    ├── wallet/          # Library for deriving keys
    └── wasm/            # Legacy wasm library
```

### Usage

Before using apps in this repo, we first need to install all
dependencies. Note that these commands are for Ubuntu and will vary on
other systems:

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

# Install wasm-bindgen-cli
cargo install wasm-bindgen-cli

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

#### macOS on Intel and Apple Silicon

On macOS, when using Apple Silicon architecture, in order to compile some packages for our wasm dependencies, you will need to install
the following:

```
xcode-select --install

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

# Mac Intel only
export CC=/usr/local/opt/llvm/bin/clang
AR=/usr/local/opt/llvm/bin/llvm-ar
```

At the root-level, we can issue commands for all packages in the monorepo. Following is an example:

```bash
# Execute all tests within monorepo
yarn test

# Lint all packages
yarn lint

# Fix linting on all packages
yarn lint:fix
```

There are also app-specific instructions in the [namada-interface README](apps/namada-interface/README.md) and the [extension README](apps/extension/README.md).

### Project Structure

The app is split in 4 major parts: `App`, `Components`, `State`, `Utils`.

- **App** - This contains a flat structure of the views of the wallet. These can be then composed in desired hierarchy and flows with routing and navigation. One of the main purposes of the components in `App` is to create layouts and map the state to the visual components.
- **Components** - These are the visual and generic components of the app. Ideally anything that the user is seeing is composed of these components.
- **State** - This lives under `slices` directory and is based on Redux and Redux Thunk using [Redux Toolkit](https://redux-toolkit.js.org). This is where the business logic of the app lives. This is where all the calls to libraries and to the network are initiated from.
- **utils** - Anything that did not go to one of the previous 3, should be here.
  - **theme** - The app is using styled-components for styling the components. There us a system in-place that maps the designs to the styles in the app. This is explanied more in detail below.

#### Utils / Theme

The styles are initially defined in Figma [here](https://www.figma.com/file/NFyHbLZXBSl3aUsMxtffvV/Namada-Wallet?node-id=3%3A12). The style consist of:

- colors
- spaces
- border radius
- type information
  - font family
  - sizes
  - weights
  - colors

All this information is typed in the app under `apps/namada-interface/src/utils/theme/theme.ts`. The 2 most important types are `PrimitiveColors` which defines the colors. And `DesignConfiguration` which collects all design tokens together. Now some of the styles are different between light and dark modes. We alrways define 2 `PrimitiveColors`, one for light and one for dark. The getter function returns the correct based on which mode the user has selected.

##### Colors

Under colors we have 6 main color groups:

- **primary** - main brand specific
- **secondary** - secondary brand specific
- **tertiary** - tertiary brand specific
- **utility1** - mostly backgrounds and panels
- **utility2** - mostly foregrounds and texts
- **utility3** - generic utils such as warning, error, ...

https://www.figma.com/file/aiWZpaXjPLW6fDjE7dpFaU/Projects-2021?node-id=9102%3A8806

##### Example

Then in styled components we can do:

```ts
export const AccountCreationContainer = styled.div`
  background-color: ${(props) => props.theme.colors.primary.main80};
`;
```

##### Exceptions

Sometimes we cannot use same color (such as `colors.primary.main80`) for both the dark and light modes. Such as the logo. In these cases we define a getter in styles component (or React) files to facilitate this difference. This is pretty verbose, yet very maintainable. This could be all central, but i feel it is better when close to the consumer.

```ts
// Button.components.ts
import { DesignConfiguration } from "utils/theme";

enum ComponentColor {
  ButtonBackground,
  ContainedButtonLabelColor,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const isDark = theme.themeConfigurations.isLightMode;
  switch (color) {
    case ComponentColor.ButtonBackground:
      return isDark ? theme.colors.primary.main : theme.colors.secondary.main;
    case ComponentColor.ContainedButtonLabelColor:
      return isDark ? theme.colors.utility3.black : theme.colors.utility3.black;
  }
};

// then we use it like this
export const ContainedButton = styled.div`
  color: ${(props) => props.theme.colors.primary.main};
  background-color: ${(props) =>
    getColor(ComponentColor.ButtonBackground, props.theme)};
`;
```

### Testing

#### Unit

```bash
# Running this from the root project directory will run unit tests
# for all packages where a test script is defined
yarn test
```

#### e2e

TBA

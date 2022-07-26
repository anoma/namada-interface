# namada-interface

<div style="width: 100%; display: flex; justify-content: center; margin-bottom: 32px;">
    <img style="width: 300px;" src="banner-image.png" />
</div>

This is the `namada-interface` monorepo. Within it, you will find the code for the web wallet implementation. it contains the following packages:

```bash
namada-interface/
├── packages/
│   ├── anoma-wallet/    # Main wallet React App
│   ├── anoma-lib/       # Rust lib for generating WASM
│   └── key-management/  # Key management library
```

## Usage

Initialize `yarn` by issuing the following command:

```bash
# First run this command in the root directory of namada-interface/:
yarn
```

Each package in the repo will have its own set of `yarn` scripts.

## Troubleshooting

When running or building the wallet on **MacOS**, it's possible compilation will fail with some error similar to that:

```
cargo:warning=error: unable to create target: 'No available targets are compatible with this triple.'
```

If that's the case, make sure you have installed both xcode-select and LLVM from brew, then run the command appending the full path of the Custom Compiler(`CC`) and the Archiver tool(`AR`):

```
xcode-select --install
brew install llvm

# M1
CC=/opt/homebrew/opt/llvm/bin/clang AR=/opt/homebrew/opt/llvm/bin/llvm-ar yarn build
# Intel
CC=/usr/local/opt/llvm/bin/clang AR=/usr/local/opt/llvm/bin/llvm-ar yarn build
```

More documentation _TBD_

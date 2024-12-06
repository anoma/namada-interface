# namada-sdk

The Namada SDK package

## Usage

### Installation

```bash
npm install @namada/sdk

# Or, via yarn
yarn add @namada/sdk
```

### Initializing the SDK

As this package depends on Wasm compiled from Rust to integrate with Namada, this must be loaded asynchronously when
developing for the Web. The following is a quick overview of some of the features of the SDK package:

```typescript
import { Sdk, getSdk } from "@namada/sdk/web";
import sdkInit from "@namada/sdk/web-init";

// Load Tx props from types package
import { BondProps, WrapperTxProps } from "@namada/types";

// Amounts are defined as BigNumber
import BigNumber from "bignumber.js";

// Define the following values:
const rpcUrl = "https://rpc.example.net";
const tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e"; // bech32m encoded NAM address
const chainId = "namada-testnet-1";

const init = async (): Promise<void> => {
  const { cryptoMemory } = await sdkInit();
  const sdk = getSdk(rpcUrl, tokenAddress, cryptoMemory);

  // Access various modules of the SDK
  const { keys, mnemonic, rpc, signing, tx } = sdk; // Alternatively, invoke getters directly, e.g., sdk.getRpc(), etc.

  // Examples:

  // Generate a 24 word mnemonic
  const mnemonicPhrase = mnemonic.generate(24).join(" ");

  // Mnemonic to seed
  const seed = mnemonic.toSeed(mnemonicPhrase);

  // Derive a keypair and address
  const bip44Path = {
    account: 0,
    change: 0,
    index: 0,
  };
  const { address, publicKey, privateKey } = keys.deriveFromSeed(
    seed,
    bip44Path
  );

  // Construct a Bond transaction
  const bondProps: BondProps = {
    source: address,
    validator: "tnam1q9vhfdur7gadtwx4r223agpal0fvlqhywylf2mzx",
    amount: BigNumber(123),
  };

  // Define Wrapper Tx props
  const wrapperTxProps: WrapperTxProps = {
    token: tokenAddress,
    feeAmount: BigNumber(1),
    gasLimit: BigNumber(1000),
    chainId: "",
    publicKey,
    memo: "A bond transaction",
  };

  // Build a Bond transaction
  const bondTx = await tx.buildBond(bondProps, wrapperTxProps);

  // Sign a Bond transaction with a private key
  const signedBondTxBytes = await signing.sign(bondTx, privateKey);

  // Broadcast the signed transaction to a node
  const txResponse = await rpc.broadcastTx(signedBondTxBytes, wrapperTxProps);
};

init();
```

### Types

Explore the generated type docs here: [modules.md](./docs/modules.md)

## Development

In order to compile the required Rust libraries locally (`@namada/crypto` and `@namada/shared`), issue one
of the following commands, depending on the environment you are targeting:

```bash
# Build wasm for single core, release mode
yarn wasm:build[:node]

# Build wasm for multicore, release mode
yarn wasm:build[:node]:multicore

# Build wasm with debugging for single core
yarn wasm:build[:node]:dev

# Build wasm with debugging for multicore
yarn wasm:build[:node]:dev:multicore

# Generate new docs
yarn build:docs
```

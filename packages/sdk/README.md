# sdk

Namada SDK package

## Development

```bash
# Build wasm for web for single core, release mode
yarn wasm:build

# Build wasm for web for multicore, release mode
yarn wasm:build:multicore

# Build wasm with debugging for single core
yarn wasm:build:dev

# Build wasm with debugging for multicore
yarn wasm:build:dev:multicore

# Build wasm for NodeJS
yarn wasm:build:node
```

## Usage

```typescript
import { Sdk } from "@namada/sdk"

// Initialize the Sdk in an async function
async function init(): Promise<void> {
    // Point to the RPC url of the ledger
    const ledgerUrl = "http://localhost:27657";

    const { tx, rpc } = await Sdk.init(ledgerUrl);

    // Build a transfer (see TxProps and TransferProps)
    const transfer = tx.buildTransfer(txProps, transferProps, "<gas payer address>");

    // Note: If signing with a Ledger hardware wallet, you may access the transfer bytes with:
    const bytes = transfer.toBytes(); // For Ledger hardware wallet signing

    // Sign this transaction using a secret key
    const signedTx = tx.signTx(transfer, "<signing key">);

    // Broadcast the signed transfer to the ledger
    await rpc.broadcastTx(signedTx).catch((e) => console.error(`Unable to broadcast Tx: ${e}`));
}

init();
```

For more information, read the [Specs](./docs/specs.md) or the [API](./docs/api.md) documentation.

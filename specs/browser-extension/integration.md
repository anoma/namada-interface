# Browser Extension - API & Integration

The extension is able to be integrated with in a similar fasion to Keplr and Metamask. If the extension has been installed (and assuming the user has gone through the process of setting up an account), we can use the following to integrate with another interface.

**NOTE** The user would need to link their `package.json` to `https://github.com/anoma/namada-interface` to import any public packages from this repo - this isn't required for integration, but it provides useful types and utilities.

## 1. Detecting the extension

If the extension is installed, and the domain is enabled (currently, all domains are enabled by the extension), detection can be achieved simply by doing the following:

```typescript=
const isExtensionInstalled = typeof window.anoma === 'object';
```

## 2. Connecting to the extension

To connect your application to the extension, you can invoke the following, providing a `chainId` for which you want to pull accounts from:

```typescript=
const chainId = 'namada-test.XXXXXXXXXX';
await anoma.connect(chainId);
```

Soon, this will prompt the user to either `Accept` or `Reject` a connection, but this isn't currently implemented.

## 3. Querying accounts

To query available accounts in the extension, we first instantiate a signing client:

```typescript=
const client = await anoma.getSigner(chainId);

const accounts = await client.accounts();

// Example accounts results:
[
    {
        "alias": "My Account",
        "address": "atest1d9khqw36xc65xwp3xc6rwsfcxpprssesxsenjs3cxpznqvfkxppnxw2989pnssfkgsenzvphx0u6kj",
        "chainId": "namada-75a7e12.69483d59a9fb174",
        "isShielded": false
    },
    ...
]
```

## 4. Encoding and signing transfer transactions

There are two types that can be imported from `namada-interface`:

```typescript=
import { TxProps, TransferProps } from "@anoma/types";
```

Where the following is defined (for reference - these are the properties we will need to provide to the signing client):

```typescript
export type TxProps = {
  token: string;
  epoch: number;
  feeAmount: number;
  gasLimit: number;
  txCode: Uint8Array;
};

export type TransferProps = {
  source: string;
  target: string;
  token: string;
  amount: number;
};
```

### 4.1 Fetching a pre-built wasm

We will need to import a pre-built `tx-transfer` wasm file to provide to `TxProps`. There is a utility (see the following) that handles fetching these:

```typescript=
import { fetchWasmCode } from "@anoma/utils";

(async () {
    const txCode = await fetchWasmCode('./path/to/tx-transfer.wasm');
    // Construct transfer transaction...
})();
```

### 4.2 Encoding a transfer tx

```typescript=
const client = anoma.getSigner("namada-test.XXXXXXXXXXX");

const address = "atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4";
// NOTE: Transfer amount is converted to micro-units
const amount = 1.23 * 1_000_000;

const transferArgs = {
  source: address,
  token: "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
  target: "atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw",
  amount,
};

const encodedTransfer = await client.encodeTransfer(transferArgs);
```

### 4.3 Signing an encoded transfer tx

```typescript=
// Set up transaction parameters:
const txProps = {
    token: "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
    // Client will need to fetch the current epoch
    epoch: 5,
    feeAmount: 1000,
    gasLimit: 1000000,
    // txCode fetched above
    txCode,
};

// Retrieve tx hash and signed bytes
const { hash, bytes } = await client.signTx(address, txProps, encodedTx);
```

The resulting `bytes` can now be broadcasted to the ledger, and we can use the `hash` returned to query the status of the transaction.

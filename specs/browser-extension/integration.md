# Namada Keychain - API & Integration

The extension is able to be integrated with in a similar fashion to Keplr and Metamask. If the extension has been installed (and assuming the user has gone through the process of
setting up an account), we can use the following to integrate with another interface.

For integrating an application with the extension, it is recommended that you import the `@namada/types` package.

## Table of Contents

- [Detecting the Extension](#detecting-the-extension)
- [Connecting to the Extension](#connecting-to-the-extension)
- [Using the Namada Keychain injected provider](#using-the-namada-keychain-injected-provider)
- [Handling Extension Events](#handling-extension-events)

## Detecting the extension

If the extension is installed, and the domain is enabled (currently, all domains are enabled by the extension), detection can be achieved simply by doing the following:

```ts
const isExtensionInstalled = typeof window.namada === "object";
```

A better practice would be to define a helper (and hook, if using React). See [useNamadaKeychain.ts](../../apps/namadillo/src/hooks/useNamadaKeychain.ts) in Namadillo for an example on how to do this.

With this hook, you can invoke like this (in React):

```ts
const { connect } = useNamadaKeychain();

// ...
await connect();
// ...
```

[ [Table of Contents](#table-of-contents) ]

## Connecting to the extension

To connect your application to the extension manually after detection, you can invoke the following, providing a `chainId`:

```ts
import { WindowWithNamada } from "@namada/types";
const chainId = "namada-test.XXXXXXXXXX";
const namada = new Namada(chainId);

async function myApp(): Promise<void> {
  const namada = (window as WindowWithNamada).namada;
  // Prompt to approve connection:
  await namada.connect(chainId);
}

myApp();
```

This will prompt the user to either `Accept` or `Reject` a connection, and a client application can `await` this response and handle it accordingly.

[ [Table of Contents](#table-of-contents) ]

## Using the Namada Keychain injected provider

The `Namada Keychain` injected class provides several methods for interacting with the keychain:

```ts
async function myApp(): Promise<void> {
  // Connect to extension
  await namada.connect(chainId);

  // Query accounts with integration
  const accounts = await namada.accounts();

  // Query default account, which is currently selected in keychain
  const defaultAccount = await namada.defaultAccount()
}

// Example accounts results:
[
    {
        "alias": "My Account",
        "address": "tnam1qry3lnk03j965y92np6e25jvadk3kw9u7cvwjclp",
        ...
    },
    ...
]
```

[ [Table of Contents](#table-of-contents) ]

### Signing with the keychain

The injected `namada` provider gives access to signing functionality. The `namada.sign()` method can sign any number of transactions with the specified account address:

```ts
// SignProps from @namada/types

export type SignProps = {
  // address of signing account
  signer: string;
  // array of TxProps, which is the type returned from the various `build...` functions in the SDK package
  txs: TxProps[];
  // Optionally, provide wasm Tx checksums in signing requests. This allows
  // the keychain to deserialize Tx data and display details
  checksums?: Record<string, string>;
};
```

The following example assumes you are building transactions with the `@namada/sdk` package. See [packages/sdk/README.md](../../packages/sdk/README.md) for more details.

```ts
import { WindowWithNamada } from "@namada/types";

// Address of signer:
const signer = "tnam1qry3lnk03j965y92np6e25jvadk3kw9u7cvwjclp";

// Within your app
const { rpc, tx } = sdk;
const bond = tx.buildBond(props);

// Using Namada Keychain to sign:
const namada = (window as WindowWithNamada).namada;

const signedTx = await namada.sign({ signer, txs: [bond] });

// See SDK for details on broadcasting:
const txResponse = await rpc.broadcastTx(signedTx, txArgs);

// NOTE: Optionally, you can use an alternative interface to signing with the Signer client.
// This can accept one or more transactions:

const client = await namada.getSigner();
const signedBond = await client.sign(signer, bond);
```

See [tx.ts](../../packages/types/src/tx/schema/tx.ts) to see properties of `TxProps` (this type is aliased from the `TxMsgValue` schema).

See [Handling Extension Events](#handling-extension-events) for more information on what extension events may be subscribed to.

[ [Table of Contents](#table-of-contents) ]

## Handling Extension Events

In the `@namada/types` package, you can import an enum providing the various events you can subscribe to in your interface.

```typscript
@import { Events } from "@namada/types";
```

The currently dispatched events are as follows:

```ts
export enum Events {
  AccountChanged = "namada-account-changed",
  TxStarted = "namada-tx-started",
  TxCompleted = "namada-tx-completed",
  UpdatedBalances = "namada-updated-balances",
  UpdatedStaking = "namada-updated-staking",
  ProposalsUpdated = "namada-proposals-updated",
  ExtensionLocked = "namada-extension-locked",
}
```

These events will prove useful when synchronizing the state of the interface with the connected extension.

[ [Table of Contents](#table-of-contents) ]

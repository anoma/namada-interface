# Browser Extension - API & Integration

The extension is able to be integrated with in a similar fashion to Keplr and Metamask. If the extension has been installed (and assuming the user has gone through the process of
setting up an account), we can use the following to integrate with another interface.

For integrating an application with the extension, it is recommended that you import the `@namada/integrations` and `@namada/types` packages.

## Table of Contents

- [Detecting the Extension](#detecting-the-extension)
- [Connecting to the Extension](#connecting-to-the-extension)
- [Using the Namada Integration](#using-the-namada-integration)
- [Using the SDK client](#using-the-sdk-client)
  - [Submitting a Transfer](#submitting-a-transfer)
- [Handling Extension Events](#handling-extension-events)

## Detecting the extension

If the extension is installed, and the domain is enabled (currently, all domains are enabled by the extension), detection can be achieved simply by doing the following:

```ts
const isExtensionInstalled = typeof window.namada === "object";
```

A better practice would be to use the `Namada` integration, which provides functionality for interacting with the Extension's public API:

```ts
import { Namada } from "@namada/integrations";

// Create integration instance
const chainId = "namada-test.XXXXXXXXXX"; // Replace with chain ID
const namada = new Namada(chainId);

// Detect extension
const isDetected = namada.detect(); // boolean
```

The `@namada/integrations` package provides a common interface for interacting with extensions, with Keplr & Metamask currently supported alongside Namada.

[ [Table of Contents](#table-of-contents) ]

## Connecting to the extension

To connect your application to the extension, you can invoke the following, providing a `chainId`:

```ts
import { Namada } from "@namada/integrations";

const chainId = "namada-test.XXXXXXXXXX";
const namada = new Namada(chainId);

async function myApp(): Promise<void> {
  await namada.connect(chainId);
}

myApp();
```

This will prompt the user to either `Accept` or `Reject` a connection, and a client application can `await` this response and handle it accordingly.

[ [Table of Contents](#table-of-contents) ]

## Using the Namada Integration

The `Namada` integration provides a convenience method to query all accounts from the extension:

```ts
async function myApp(): Promise<void> {
  // Connect to extension
  await namada.connect(chainId);

  // Query accounts with integration
  const accounts = await client.accounts();

  // Alternatively, and as is most often the case, you will be interacting with the SDK client,
  // which contains this function as well:
  const client = await namada.signer();
  console.log(await client.accounts());
}

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

The `Namada` integration can also be used to query balances for these accounts:

```ts
const owner =
  "atest1d9khqw36xc65xwp3xc6rwsfcxpprssesxsenjs3cxpznqvfkxppnxw2989pnssfkgsenzvphx0u6kj";
const balances = await client.queryBalances(owner);
```

[ [Table of Contents](#table-of-contents) ]

## Using the SDK client

The SDK client (an instance of the `Signer` class, defined in [Signer.ts](https://github.com/anoma/namada-interface/blob/main/apps/extension/src/provider/Signer.ts)),
provides the functionality of encoding transactions to be signed and broadcasted by the SDK, passing
these encoded transactions to the [Namada.ts](https://github.com/anoma/namada-interface/blob/main/apps/extension/src/provider/Namada.ts)
provider (which is responsible for constructing messages to pass into the extension). The `Signer` represents
a portion of the public API exposed when the extension is installed.

### Submitting a Transfer

In order to submit a `Transfer` transaction via the extension integration, we can make use of the `AccountType`, TransferProps`and`TxProps` type definitions.

```ts
import { AccountType, TransferProps, TxProps } from "@namada/types";
```

`TxProps` represents the transaction parameters, whereas `TransferProp` represents the details of the transfer itself.
We use the `AccountType` enum to specify the type of account, which in turn will determine how signing occurs (e.g., if
the account is of type `AccountType.Ledger`, we will expect signing to occur externally on the hardware wallet, otherwise,
the extension will query the keystore for the keys associated with that `source` address, and sign via the SDK).

Consider this example:

```ts
import { AccountType, TransferProps, TxProps } from "@namada/types";

// Address for NAM token
const token =
  "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
const chainId = "namada-devnet.95bcc8eaf0f39f1d3fa27629";

const myTransferTx: TransferProps = {
  source:
    "atest1d9khqw36g3ryxd29xgmrjsjr89znsse5g5cn2wpsgs6nqv33xguryw2p89znsd2rxqcnzvehcnyzxw",
  target:
    "atest1d9khqw36xcmyzve3gvmrqdfexdz5zd2rxu6nv3zp8ym5zwfcgyeygv2x8pzrz3fcgscngs3nchvahj",
  token,
  amount: new BigNumber(1.234),
  nativeToken: "NAM",
  // NOTE: tx adheres to the TxProps type
  tx: {
    token,
    feeAmount: new BigNumber(100),
    gasLimit: new BigNumber(200),
    chainId,
  },
};

async function myApp(): Promise<void> {
  const namada = new Namada("namada-test.XXXXXXXXXX");

  if (!namada.detect()) {
    throw new Error("The extension is not installed!");
  }

  const client = namada.signer();

  await client
    .submitTransfer(myTransferTx, AccountType.PrivateKey)
    .then(() =>
      console.log("Transaction was approved by user and submitted via the SDK")
    )
    .catch((e) => console.error(`Transaction was rejected: ${e}`));
}

myApp();
```

In the above example, we define the transfer transaction properties, connect to the extension, and submit
a transfer transaction. The extension will launch a popup prompting the user for approval. Once the transfer
is approved, an event is dispatched from the extension indicating that a transaction has started, along with
the transaction type. When the transaction is completed, another event will fire indicating it's status.
If the transaction fails in the SDK, the returned error will be dispatched in the completion event.

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

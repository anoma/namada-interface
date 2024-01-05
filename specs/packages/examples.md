# SDK - Examples

## Table of Contents

- [Loading the SDK and Query](#loading-the-sdk-and-query)
- [Transaction requirements](#transaction-requirements)
- [Sending a transaction](#sending-a-transaction)
  - [Using stored keys](#using-stored-keys)
  - [Using a Ledger HW Wallet](#using-a-ledger-hw-wallet)
- [Querying for data](#querying-for-data)
- [Sending a tx with the extension](#sending-a-transaction-with-the-extension-api)

## Loading the SDK and Query from wasm

When using the extension from a TypeScript application, we need to first compile the wasm of the `@namada/shared` package:

```bash
# If within the namada-interface repo, we can run:
cd `packages/shared`
yarn wasm:build
```

Assuming that the `@namada/shared` package is in the scope of your application, we can instantiate the SDK, as well as the `Query` class (which is needed
to query the chain for data). This must occur within an `async` function, as we need to `await` the loading of the wasm:

```ts
import { Query, Sdk } from "@namada/shared";
// Import wasm initialization function
import { init as initShared } from "@namada/shared/src/init";

const RPC_URL = "http://127.0.0.1:26657";

async function init() {
  await initShared();

  const sdk = new Sdk(RPC_URL);
  const query = new Query(RPC_URL);

  // The SDK & Query are now ready to use

  // Load keys into the SDK:
  // sdk.add_key(privateKey, password, alias)
}

init();
```

[ [Table of Contents](#table-of-contents) ]

## Transaction requirements

The `@namada/types` package contains the [schema](https://github.com/anoma/namada-interface/tree/main/packages/types/src/tx/schema) necessary to serialize transaction data
before submitting it with the SDK. This serialization is performed by the [@dao-xyz/borsh](https://github.com/dao-xyz/borsh-ts) package. To serialize these values, you need
to provide the required properties as defined in [types.ts](https://github.com/anoma/namada-interface/blob/main/packages/types/src/tx/types.ts). Following is an example of how
to serialize a `Transfer` transaction using `borsh-ts`:

```ts
import { Message, Tokens, TransferProps, TransferMsgValue, TxProps } from `@namada/types`;

const createTransfer = (transferProps: TransferProps): Uint8Array => {
    const transferMsgValue = new TransferMsgValue(transferProps);
    const transferMessage = new Message<TransferMsgValue>();
    const serializedTransfer = transferMessage.encode(transferMsgValue);

    return serializedTransfer;
}

const tokenAddress = Tokens["NAM"].address;

const transfer = createTransfer({
    // NOTE: "source" is the signing account in this Tx, and thus must have a corresponding keypair in the SDK
    source: "atest1d9khqw36g3ryxd29xgmrjsjr89znsse5g5cn2wpsgs6nqv33xguryw2p89znsd2rxqcnzvehcnyzxw",
    target: "atest1d9khqw36xcmyzve3gvmrqdfexdz5zd2rxu6nv3zp8ym5zwfcgyeygv2x8pzrz3fcgscngs3nchvahj",
    token: tokenAddress,
    amount: new BigNumber(1.234),
    nativeToken: "NAM",
    // NOTE: tx must adhere to the TxProps type
    tx: {
        token: tokenAddress,
        feeAmount: new BigNumber(100),
        gasLimit: new BigNumber(200),
        chainId: "namada-devnet.95bcc8eaf0f39f1d3fa27629",
    }
});

```

The serialized `transfer` in the above example is ready to send via the SDK.

[ [Table of Contents](#table-of-contents) ]

## Sending a transaction

Building on the previous section, we can send transaction through the SDK using two approaches. The first approach assumes you have
a locally stored keypair with which you want to sign. The second approach involves signing a transaction using a Ledger Hardware Wallet.

### Using Stored Keys

```ts
import { Sdk } from "@namada/shared";
// Import wasm initialization function
import { init as initShared } from "@namada/shared/src/init";
import { Tokens } from "@namada/types";
import { createTransfer } from "example";

const RPC_URL = "http://127.0.0.1:26657";

// For this example, let's use the following signing account:
const account = {
    alias: "My Account",
    address: "atest1d9khqw36g3ryxd29xgmrjsjr89znsse5g5cn2wpsgs6nqv33xguryw2p89znsd2rxqcnzvehcnyzxw",
    privateKey: [0, 0, 0, 0, 0, 0, 0...], // Byte array of private key
};

async function init() {
  await initShared();

  const sdk = new Sdk(RPC_URL);
  sdk.add_key(account.privateKey, "secret password", account.alias);

  const tokenAddress = Tokens["NAM"].address;

  const transferMsg = createTransfer({
    source: account.address,
    target: "atest1d9khqw36xcmyzve3gvmrqdfexdz5zd2rxu6nv3zp8ym5zwfcgyeygv2x8pzrz3fcgscngs3nchvahj",
    token: tokenAddress,
    amount: new BigNumber(1.234),
    nativeToken: "NAM",
    // NOTE: tx must adhere to the TxProps type
    tx: {
        token: tokenAddress,
        feeAmount: new BigNumber(100),
        gasLimit: new BigNumber(200),
        chainId: "namada-devnet.95bcc8eaf0f39f1d3fa27629",
    }
  });

  await sdk.submit_transfer(transferMsg, "secret")
    .then(() => console.log("Success!"))
    .catch((e) => console.error(`An error occurred: ${e}`));
}

init();
```

Other transaction types follow a similar pattern. The only exception is if the transaction is to be signed by the [Ledger hardware wallet](#using-a-ledger-hw-wallet).

[ [Table of Contents](#table-of-contents) ]

### Using a Ledger HW Wallet

This process differs from using keypairs for signing as it requires additional steps for signing to occur externally:

1. With transaction details gathered from user, we first _build_ the transaction
2. The bytes of this transaction are passed to the Ledger HW wallet for signing
3. The signatures from the Ledger, along with the original transaction bytes, are passed into the SDK where the signatures will be appended, and finally broadcasted

```ts
import { Sdk, TxType } from "@namada/shared";
// Import wasm initialization function
import { init as initShared } from "@namada/shared/src/init";
import { Message, Tokens, SignatureMsgValue } from "@namada/types";
import { createTransfer } from "example";
import {
  NamadaApp,
  ResponseAppInfo,
  ResponseSign,
  ResponseVersion,
  LedgerError,
} from "@zondax/ledger-namada";

// Import Ledger transports
import TransportUSB from "@ledgerhq/hw-transport-webusb";
import Transport from "@ledgerhq/hw-transport";

const RPC_URL = "http://127.0.0.1:26657";

// For this example, let's use the following Ledger account:
const account = {
  alias: "My Ledger Account",
  address:
    "atest1d9khqw36g3ryxd29xgmrjsjr89znsse5g5cn2wpsgs6nqv33xguryw2p89znsd2rxqcnzvehcnyzxw",
  path: "m/44'/877'/0'/0/0",
};

async function myApp(): Promise<void> {
  await initShared();

  const sdk = new Sdk(RPC_URL);

  // Initialize Ledger transport and Namada ledger app
  // NOTE: A class exists in the extension which simplifies the handling of the Ledger, which will
  // be moved to a public package in the future. Following is the manual process:
  const transport = await TransportUSB.create();
  const namadaApp = new NamadaApp(transport);
  const ledger = new Ledger(namadaApp);

  if (!ledger) {
    throw new Error("Ledger initialization failed!");
  }

  const {
    version: { returnCode, errorMessage },
  } = await ledger.status();

  // Validate Ledger state first
  if (returnCode !== LedgerError.NoErrors) {
    await ledger.closeTransport();
    throw new Error(errorMessage);
  }

  // Query public key from Ledger
  const { address } = ledger.getAddressAndPubKey(account.path);
  account.publicKey = address.toString();

  // Construct transfer details
  const tokenAddress = Tokens["NAM"].address;

  const transferMsg = createTransfer({
    source: account.address,
    target:
      "atest1d9khqw36xcmyzve3gvmrqdfexdz5zd2rxu6nv3zp8ym5zwfcgyeygv2x8pzrz3fcgscngs3nchvahj",
    token: tokenAddress,
    amount: new BigNumber(1.234),
    nativeToken: "NAM",
    // NOTE: tx must adhere to the TxProps type
    tx: {
      token: tokenAddress,
      feeAmount: new BigNumber(100),
      gasLimit: new BigNumber(200),
      chainId: "namada-devnet.95bcc8eaf0f39f1d3fa27629",
      // Public key is required for Ledger tx!
      publicKey: account.publicKey,
    },
  });

  try {
    // Get tx bytes from SDK
    const txBytes = await sdk.get_tx_bytes(transferMsg, TxType.Transfer);

    // Sign with Ledger
    const response = await ledger.sign(account.path, txBytes);
    // NOTE: A helper utility `encodeSignature` exists in the extension utils - this
    // will be moved to a public package in the future. The following is how we encode a signature
    // manually
    const {
      pubkey,
      raw_indices,
      raw_signature,
      wrapper_indices,
      wrapper_signature,
    } = response;

    // Due to how data is serialized on the Ledger, we have to coerce the types to
    // get the correct data for now:

    const props = {
      /* eslint-disable */
      pubkey: new Uint8Array((pubkey as any).data),
      rawIndices: new Uint8Array((raw_indices as any).data),
      rawSignature: new Uint8Array((raw_signature as any).data),
      wrapperIndices: new Uint8Array((wrapper_indices as any).data),
      wrapperSignature: new Uint8Array((wrapper_signature as any).data),
      /* eslint-enable */
    };

    // Encode the signatures for passing into the SDK
    const value = new SignatureMsgValue(props);
    const msg = new Message<SignatureMsgValue>();
    const sig = msg.encode(value);

    // Finally, submit the tx along with the encoded signatures to the SDK for signing and broadcasting
    await sdk
      .submit_signed_tx(tx, sig)
      .then(() => console.log("Successfully submitted tx"))
      .catch((e) => console.error(`An error occurred: ${e}`));
  } catch (e) {
    console.error(`Ledger signing failed: ${e}`);
  }
}

init();
```

[ [Table of Contents](#table-of-contents) ]

## Querying for data

We make use of the `Query` class instance for querying the chain for data. This is instantiated much like the SDK:

```ts
import { Query } from "@namada/shared";
// Import wasm initialization function
import { init as initShared } from "@namada/shared/src/init";

const RPC_URL = "http://127.0.0.1:26657";

async function init() {
  await initShared();

  const query = new Query(RPC_URL);

  // Query is now ready to use

  const ownerAddress =
    "atest1d9khqw36g3ryxd29xgmrjsjr89znsse5g5cn2wpsgs6nqv33xguryw2p89znsd2rxqcnzvehcnyzxw";
  const tokenAddress =
    "atest1d9khqw36xcmyzve3gvmrqdfexdz5zd2rxu6nv3zp8ym5zwfcgyeygv2x8pzrz3fcgscngs3nchvahj";

  // Balance query
  // NOTE: `query_balance` contains logic to determine whether this is a "transparent" or "shielded" balance query. The API is simply this:
  const balance = await query.query_balance(ownerAddress, tokenAddress);

  // Epoch query
  const epoch = await query.query_epoch();

  // Query all validators
  const allValidators = await query.query_all_validators();

  // Query my validators - accepts an array of addresses
  const myValidators = await query.query_my_validators([ownerAddress]);

  // Query public key - used to determine if the public key has been revealed on chain
  const pk = await query.query_public_key(ownerAddress);
}

init();
```

[ [Table of Contents](#table-of-contents) ]

## Sending a transaction with the Extension API

An overview of interacting with the Extension API (which is exposed to interfaces when the extension is installed), can be found in [integration.md](../browser-extension/integration.md).
This API is preferred if your goal is only to integrate an application with the extension, and not interact directly with the SDK.

[ [Table of Contents](#table-of-contents) ]

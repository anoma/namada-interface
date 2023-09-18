# SDK - Examples

## Table of Contents

- [Loading the SDK and Query](#loading-the-sdk-and-query)
- [Transaction requirements](#transaction-requirements)
- [Sending a transaction](#sending-a-transaction)
- [Querying for balance](#querying-for-balance)
- [Sending a tx with the extension]()

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
to provide the required properites as defined in [types.ts](https://github.com/anoma/namada-interface/blob/main/packages/types/src/tx/types.ts). Following is an example of how
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

The serialized `transfer` in the above example is ready to send via the SDK:

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

[ [Table of Contents](#table-of-contents) ]

## Sending a transaction

**TODO**

[ [Table of Contents](#table-of-contents) ]

## Querying for balance

**TODO**

[ [Table of Contents](#table-of-contents) ]

## Sending a transaction with the Extension API

**TODO**

[ [Table of Contents](#table-of-contents) ]


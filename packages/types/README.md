# types

This package is to provide types shared between applications in the Namada ecosystem, primarily that of
the `namada-interface` and `extension` apps.

Some types from `@keplr-wallet/types` have been aliased and re-exported, as we may want to support a
more custom configuration for chain and currency configurations. These have been added to reduce the
work necessary to refactor against a custom type definition.

The exported `Namada` and `WindowWithNamada` types serve as a public interface allowing other applications to
integrate with the APIs provided by the extension using TypeScript.

## Borsh schemas

In `src/tx`, we have several schemas for handling Borsh serialization and deserialization when submitting transaction data. As
transaction data from the user needs to move between an external application and the extension, this allow greater
privacy using with the `postMessage` API. These directly correlate to Rust `struct`s defined in the `@namada/shared` package,
but exist here as to decouple them from the wasm dependency in the build pipeline. Including `@namada/shared` would imply
that you're willing to deliver compiled wasm in your final bundle, but that shouldn't be the case when you're merely
interacting with the extension.

These types are primarily to be used by the `Signer`, a class which will do the work of serializing transaction data
from the user and passing into the extension where the associated private keys can be used to sign data within the transaction.

### Example usage of schemas

An application can serialize transaction data using these schemas as follows:

```ts
import { Message, TransferMsgSchema, TransferMsgValue } from "@namada/types";

// The user's data for transfer:
const source =
  "atest1v4ehgw368ycryv2z8qcnxv3cxgmrgvjpxs6yg333gym5vv2zxepnj334g4rryvj9xucrgve4x3xvr4";
const target =
  "atest1v4ehgw36xvcyyvejgvenxs34g3zygv3jxqunjd6rxyeyys3sxy6rwvfkx4qnj33hg9qnvse4lsfctw";
const token =
  "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5";
const amount = 123.45;

// Instantiate the appropriate class with the user's data:
const transferMsgValue = new TransferMsgValue({
  source,
  target,
  token,
  amount,
});

// We construct a new "transfer" Message, specifying the _type_ as a type parameter:
const transferMessage = new Message<TransferMsgValue>();
const encoded = transferMessage.encode(TransferMsgSchema, transferMsgValue);

// We have now created the encoded Namada `Transfer`, and can also serialize a "Transaction" data message
// to specify the transaction parameters:
const epoch = 5;
const feeAmount = 1000;
const gasLimit = 1_000_000;
const txCode = new Uint8Array([]); // This is the byte array of the tx-transfer.wasm

// Transaction Message
const txMessage = new Message<TransactionMsgValue>();

// Transaction Message Value
const txMessageValue = new TransactionMsgValue({
  token,
  epoch,
  fee_amount: feeAmount,
  gas_limit: gasLimit,
  tx_code: txCode,
});
```

The `encoded` transfer may then be handed off to a `Signer` which will invoke the related wasm functions to wrap and sign
the transaction. _Note_ that it is also the responsibility of the extension to look up the associated private key for the
provided `source` address, hence why `secret` does not appear in the schema. The private key will be decrypted from storage
in the extension at the point it is required to sign a transaction, with the results returned in a message back to the signer,
at which point the resulting data can be broadcast to the ledger.

**NOTE** While these types provide provisions for _deserialization_, when wrapping and signing transactions, it's not a
necessary step. Within the wasm, a transaction will be wrapped, signed, and return in the form of the transaction hash and
the encrypted bytes of that transaction. Encoding these two values with Borsh would be superfluous, as the Tx hash is already
public, and the bytes of the tx are encrypted.

### References

- `near/borsh`: <https://github.com/near/borsh>
- `near/borsh-js`: <https://github.com/near/borsh-js>

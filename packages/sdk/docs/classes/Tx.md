[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / Tx

# Class: Tx

SDK functionality related to transactions

## Table of contents

### Constructors

- [constructor](Tx.md#constructor)

### Properties

- [sdk](Tx.md#sdk)

### Methods

- [appendSignature](Tx.md#appendsignature)
- [buildBatch](Tx.md#buildbatch)
- [buildBond](Tx.md#buildbond)
- [buildEthBridgeTransfer](Tx.md#buildethbridgetransfer)
- [buildIbcTransfer](Tx.md#buildibctransfer)
- [buildRedelegate](Tx.md#buildredelegate)
- [buildRevealPk](Tx.md#buildrevealpk)
- [buildTransparentTransfer](Tx.md#buildtransparenttransfer)
- [buildTx](Tx.md#buildtx)
- [buildTxFromSerializedArgs](Tx.md#buildtxfromserializedargs)
- [buildUnbond](Tx.md#buildunbond)
- [buildVoteProposal](Tx.md#buildvoteproposal)
- [buildWithdraw](Tx.md#buildwithdraw)
- [deserialize](Tx.md#deserialize)
- [encodeTxArgs](Tx.md#encodetxargs)
- [revealPk](Tx.md#revealpk)

## Constructors

### constructor

• **new Tx**(`sdk`): [`Tx`](Tx.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sdk` | `Sdk` | Instance of Sdk struct from wasm lib |

#### Returns

[`Tx`](Tx.md)

#### Defined in

[sdk/src/tx/tx.ts:45](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L45)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:45](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L45)

## Methods

### appendSignature

▸ **appendSignature**(`txBytes`, `ledgerSignatureResponse`): `Uint8Array`

Append signature for transactions signed by Ledger Hardware Wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txBytes` | `Uint8Array` | Serialized transaction |
| `ledgerSignatureResponse` | `ResponseSign` | Serialized signature as returned from Ledger |

#### Returns

`Uint8Array`

- Serialized Tx bytes with signature appended

#### Defined in

[sdk/src/tx/tx.ts:412](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L412)

___

### buildBatch

▸ **buildBatch**(`txs`, `wrapperTxMsg`): [`BuiltTx`](BuiltTx.md)

Build a batched transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txs` | [`BuiltTx`](BuiltTx.md)[] | array of BuiltTx types |
| `wrapperTxMsg` | `Uint8Array` | Uint8Array of serialized WrapperTxMsg |

#### Returns

[`BuiltTx`](BuiltTx.md)

a BuiltTx type

#### Defined in

[sdk/src/tx/tx.ts:385](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L385)

___

### buildBond

▸ **buildBond**(`wrapperTxProps`, `bondProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Bond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `bondProps` | `BondMsgValue` | properties of the bond tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to bondProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:204](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L204)

___

### buildEthBridgeTransfer

▸ **buildEthBridgeTransfer**(`wrapperTxProps`, `ethBridgeTransferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ethereum Bridge Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ethBridgeTransferProps` | `EthBridgeTransferMsgValue` | properties of the eth bridge transfer tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to ethBridgeTransferProps.sender |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:333](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L333)

___

### buildIbcTransfer

▸ **buildIbcTransfer**(`wrapperTxProps`, `ibcTransferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ibc Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ibcTransferProps` | `IbcTransferMsgValue` | properties of the ibc transfer tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to ibcTransferProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:306](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L306)

___

### buildRedelegate

▸ **buildRedelegate**(`wrapperTxProps`, `redelegateProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Redelegate Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `redelegateProps` | `RedelegateMsgValue` | properties of the redelegate tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to redelegateProps.owner |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:279](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L279)

___

### buildRevealPk

▸ **buildRevealPk**(`wrapperTxProps`, `gasPayer`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build RevealPK Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `gasPayer` | `string` | address for gas payer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:182](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L182)

___

### buildTransparentTransfer

▸ **buildTransparentTransfer**(`wrapperTxProps`, `transferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `transferProps` | `TransparentTransferMsgValue` | properties of the transfer |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to transferProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:155](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L155)

___

### buildTx

▸ **buildTx**(`txType`, `wrapperTxProps`, `props`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Wrapper method to handle all supported Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txType` | [`TxType`](../enums/TxType.md) | type of the transaction |
| `wrapperTxProps` | `WrapperTxMsgValue` | transaction properties |
| `props` | `unknown` | Props specific to type of Tx |
| `gasPayer?` | `string` | optional gas payer, defaults to source or sender |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:81](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L81)

___

### buildTxFromSerializedArgs

▸ **buildTxFromSerializedArgs**(`txType`, `encodedSpecificTx`, `wrapperTxMsg`, `gasPayer`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build a transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txType` | [`TxType`](../enums/TxType.md) | type of the transaction |
| `encodedSpecificTx` | `Uint8Array` | encoded specific transaction |
| `wrapperTxMsg` | `Uint8Array` | encoded transaction |
| `gasPayer` | `string` | address of the gas payer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:56](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L56)

___

### buildUnbond

▸ **buildUnbond**(`wrapperTxProps`, `unbondProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Unbond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `unbondProps` | `UnbondMsgValue` | properties of the unbond tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to unbondProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:229](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L229)

___

### buildVoteProposal

▸ **buildVoteProposal**(`wrapperTxProps`, `voteProposalProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Built Vote Proposal Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `voteProposalProps` | `VoteProposalMsgValue` | properties of the vote proposal tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to voteProposalProps.signer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:360](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L360)

___

### buildWithdraw

▸ **buildWithdraw**(`wrapperTxProps`, `withdrawProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Withdraw Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `withdrawProps` | `WithdrawMsgValue` | properties of the withdraw tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to withdrawProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:254](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L254)

___

### deserialize

▸ **deserialize**(`txBytes`, `wasmHashes`): `TxDetails`

Method to retrieve JSON strings for all commitments of a Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txBytes` | `Uint8Array` | Bytes of a transaction |
| `wasmHashes` | `WasmHash`[] | Array of wasm paths with their associated hash |

#### Returns

`TxDetails`

a TxDetails object

#### Defined in

[sdk/src/tx/tx.ts:465](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L465)

___

### encodeTxArgs

▸ **encodeTxArgs**(`wrapperTxProps`): `Uint8Array`

Helper to encode Tx args given TxProps

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |

#### Returns

`Uint8Array`

Serialized WrapperTxMsgValue

#### Defined in

[sdk/src/tx/tx.ts:453](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L453)

___

### revealPk

▸ **revealPk**(`signingKey`, `wrapperTxProps`, `chainId?`): `Promise`\<`void`\>

Reveal Public Key using serialized Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signingKey` | `string` | signing key |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `chainId?` | `string` | optional chain ID - will enforce validation if present |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:397](https://github.com/anoma/namada-interface/blob/377244de/packages/sdk/src/tx/tx.ts#L397)

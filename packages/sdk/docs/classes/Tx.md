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

[sdk/src/tx/tx.ts:46](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L46)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:46](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L46)

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

[sdk/src/tx/tx.ts:282](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L282)

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

[sdk/src/tx/tx.ts:255](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L255)

___

### buildBond

▸ **buildBond**(`wrapperTxProps`, `bondProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Bond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `bondProps` | `BondMsgValue` | properties of the bond tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:95](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L95)

___

### buildEthBridgeTransfer

▸ **buildEthBridgeTransfer**(`wrapperTxProps`, `ethBridgeTransferProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ethereum Bridge Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ethBridgeTransferProps` | `EthBridgeTransferMsgValue` | properties of the eth bridge transfer tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:207](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L207)

___

### buildIbcTransfer

▸ **buildIbcTransfer**(`wrapperTxProps`, `ibcTransferProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ibc Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ibcTransferProps` | `IbcTransferMsgValue` | properties of the ibc transfer tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:183](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L183)

___

### buildRedelegate

▸ **buildRedelegate**(`wrapperTxProps`, `redelegateProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Redelegate Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `redelegateProps` | `RedelegateMsgValue` | properties of the redelegate tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:159](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L159)

___

### buildRevealPk

▸ **buildRevealPk**(`wrapperTxProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build RevealPK Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:80](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L80)

___

### buildTransparentTransfer

▸ **buildTransparentTransfer**(`wrapperTxProps`, `transferProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `transferProps` | `TransparentTransferMsgValue` | properties of the transfer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:55](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L55)

___

### buildUnbond

▸ **buildUnbond**(`wrapperTxProps`, `unbondProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Unbond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `unbondProps` | `UnbondMsgValue` | properties of the unbond tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:114](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L114)

___

### buildVoteProposal

▸ **buildVoteProposal**(`wrapperTxProps`, `voteProposalProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Built Vote Proposal Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `voteProposalProps` | `VoteProposalMsgValue` | properties of the vote proposal tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:232](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L232)

___

### buildWithdraw

▸ **buildWithdraw**(`wrapperTxProps`, `withdrawProps`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Withdraw Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `withdrawProps` | `WithdrawMsgValue` | properties of the withdraw tx |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:137](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L137)

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

[sdk/src/tx/tx.ts:335](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L335)

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

[sdk/src/tx/tx.ts:323](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L323)

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

[sdk/src/tx/tx.ts:267](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/tx/tx.ts#L267)

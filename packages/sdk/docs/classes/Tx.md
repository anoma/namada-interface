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

[sdk/src/tx/tx.ts:34](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L34)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:34](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L34)

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

[sdk/src/tx/tx.ts:401](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L401)

___

### buildBatch

▸ **buildBatch**(`txType`, `txs`): [`BatchTx`](BatchTx.md)

Build a batched transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txType` | [`TxType`](../enums/TxType.md) | transaction type enum |
| `txs` | [`BuiltTx`](BuiltTx.md)[] | array of BuiltTx types |

#### Returns

[`BatchTx`](BatchTx.md)

a BatchTx type

#### Defined in

[sdk/src/tx/tx.ts:374](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L374)

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

[sdk/src/tx/tx.ts:193](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L193)

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

[sdk/src/tx/tx.ts:322](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L322)

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

[sdk/src/tx/tx.ts:295](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L295)

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

[sdk/src/tx/tx.ts:268](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L268)

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

[sdk/src/tx/tx.ts:171](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L171)

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

[sdk/src/tx/tx.ts:144](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L144)

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

[sdk/src/tx/tx.ts:70](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L70)

___

### buildTxFromSerializedArgs

▸ **buildTxFromSerializedArgs**(`txType`, `encodedSpecificTx`, `encodedTx`, `gasPayer`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build a transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txType` | [`TxType`](../enums/TxType.md) | type of the transaction |
| `encodedSpecificTx` | `Uint8Array` | encoded specific transaction |
| `encodedTx` | `Uint8Array` | encoded transaction |
| `gasPayer` | `string` | address of the gas payer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:45](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L45)

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

[sdk/src/tx/tx.ts:218](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L218)

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

[sdk/src/tx/tx.ts:349](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L349)

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

[sdk/src/tx/tx.ts:243](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L243)

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

[sdk/src/tx/tx.ts:442](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L442)

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

[sdk/src/tx/tx.ts:386](https://github.com/anoma/namada-interface/blob/f5f7d02d/packages/sdk/src/tx/tx.ts#L386)

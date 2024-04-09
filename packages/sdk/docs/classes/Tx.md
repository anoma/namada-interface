[@namada/sdk](../README.md) / [Exports](../modules.md) / Tx

# Class: Tx

SDK functionality related to transactions

## Table of contents

### Constructors

- [constructor](Tx.md#constructor)

### Properties

- [sdk](Tx.md#sdk)

### Methods

- [appendSignature](Tx.md#appendsignature)
- [buildBond](Tx.md#buildbond)
- [buildEthBridgeTransfer](Tx.md#buildethbridgetransfer)
- [buildIbcTransfer](Tx.md#buildibctransfer)
- [buildRevealPk](Tx.md#buildrevealpk)
- [buildTransfer](Tx.md#buildtransfer)
- [buildTx](Tx.md#buildtx)
- [buildTxFromSerializedArgs](Tx.md#buildtxfromserializedargs)
- [buildUnbond](Tx.md#buildunbond)
- [buildVoteProposal](Tx.md#buildvoteproposal)
- [buildWithdraw](Tx.md#buildwithdraw)
- [encodeTxArgs](Tx.md#encodetxargs)
- [revealPk](Tx.md#revealpk)
- [signTx](Tx.md#signtx)

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

[sdk/src/tx/tx.ts:32](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L32)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:32](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L32)

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

[sdk/src/tx/tx.ts:354](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L354)

___

### buildBond

▸ **buildBond**(`txProps`, `bondProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Bond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `bondProps` | `BondMsgValue` | properties of the bond tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to bondProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:174](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L174)

___

### buildEthBridgeTransfer

▸ **buildEthBridgeTransfer**(`txProps`, `ethBridgeTransferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ethereum Bridge Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `ethBridgeTransferProps` | `EthBridgeTransferMsgValue` | properties of the eth bridge transfer tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to ethBridgeTransferProps.sender |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:276](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L276)

___

### buildIbcTransfer

▸ **buildIbcTransfer**(`txProps`, `ibcTransferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Ibc Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `ibcTransferProps` | `IbcTransferMsgValue` | properties of the ibc transfer tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to ibcTransferProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:249](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L249)

___

### buildRevealPk

▸ **buildRevealPk**(`txProps`, `publicKey`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build RevealPK Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `publicKey` | `string` | public key to reveal |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:155](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L155)

___

### buildTransfer

▸ **buildTransfer**(`txProps`, `transferProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `transferProps` | `TransferMsgValue` | properties of the transfer |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to transferProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:128](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L128)

___

### buildTx

▸ **buildTx**(`txType`, `txProps`, `props`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Wrapper method to handle all supported Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txType` | [`TxType`](../enums/TxType.md) | type of the transaction |
| `txProps` | `TxMsgValue` | transaction properties |
| `props` | `unknown` | Props specific to type of Tx |
| `gasPayer?` | `string` | optional gas payer, defaults to source or sender |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:68](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L68)

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

[sdk/src/tx/tx.ts:43](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L43)

___

### buildUnbond

▸ **buildUnbond**(`txProps`, `unbondProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Unbond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `unbondProps` | `UnbondMsgValue` | properties of the unbond tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to unbondProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:199](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L199)

___

### buildVoteProposal

▸ **buildVoteProposal**(`txProps`, `voteProposalProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Built Vote Proposal Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `voteProposalProps` | `VoteProposalMsgValue` | properties of the vote proposal tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to voteProposalProps.signer |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:303](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L303)

___

### buildWithdraw

▸ **buildWithdraw**(`txProps`, `withdrawProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Withdraw Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `withdrawProps` | `WithdrawMsgValue` | properties of the withdraw tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to withdrawProps.source |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:224](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L224)

___

### encodeTxArgs

▸ **encodeTxArgs**(`txProps`): `Uint8Array`

Helper to encode Tx args given TxProps

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |

#### Returns

`Uint8Array`

Serialized TxMsgValue

#### Defined in

[sdk/src/tx/tx.ts:395](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L395)

___

### revealPk

▸ **revealPk**(`signingKey`, `txProps`): `Promise`\<`void`\>

Reveal Public Key using serialized Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signingKey` | `string` | signing key |
| `txProps` | `TxMsgValue` | properties of the transaction |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:343](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L343)

___

### signTx

▸ **signTx**(`encodedTx`, `signingKey?`): `Promise`\<[`SignedTx`](SignedTx.md)\>

Sign transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `encodedTx` | [`EncodedTx`](EncodedTx.md) | encoded transaction |
| `signingKey?` | `string` | optional in the case of shielded tx |

#### Returns

`Promise`\<[`SignedTx`](SignedTx.md)\>

promise that resolves to a SignedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:329](https://github.com/anoma/namada-interface/blob/9ed51c8a/packages/sdk/src/tx/tx.ts#L329)

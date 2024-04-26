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
- [buildBond](Tx.md#buildbond)
- [buildEthBridgeTransfer](Tx.md#buildethbridgetransfer)
- [buildIbcTransfer](Tx.md#buildibctransfer)
- [buildRedelegate](Tx.md#buildredelegate)
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

[sdk/src/tx/tx.ts:34](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L34)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:34](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L34)

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

[sdk/src/tx/tx.ts:389](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L389)

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

[sdk/src/tx/tx.ts:182](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L182)

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

[sdk/src/tx/tx.ts:311](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L311)

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

[sdk/src/tx/tx.ts:284](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L284)

___

### buildRedelegate

▸ **buildRedelegate**(`txProps`, `redelegateProps`, `gasPayer?`): `Promise`\<[`EncodedTx`](EncodedTx.md)\>

Build Redelegate Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | properties of the transaction |
| `redelegateProps` | `RedelegateMsgValue` | properties of the redelegate tx |
| `gasPayer?` | `string` | optional gas payer, if not provided, defaults to redelegateProps.owner |

#### Returns

`Promise`\<[`EncodedTx`](EncodedTx.md)\>

promise that resolves to an EncodedTx

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:257](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L257)

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

[sdk/src/tx/tx.ts:163](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L163)

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

[sdk/src/tx/tx.ts:136](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L136)

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

[sdk/src/tx/tx.ts:70](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L70)

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

[sdk/src/tx/tx.ts:45](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L45)

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

[sdk/src/tx/tx.ts:207](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L207)

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

[sdk/src/tx/tx.ts:338](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L338)

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

[sdk/src/tx/tx.ts:232](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L232)

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

[sdk/src/tx/tx.ts:430](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L430)

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

[sdk/src/tx/tx.ts:378](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L378)

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

[sdk/src/tx/tx.ts:364](https://github.com/anoma/namada-interface/blob/b9bf6889/packages/sdk/src/tx/tx.ts#L364)

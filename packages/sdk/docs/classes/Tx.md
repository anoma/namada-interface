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
- [buildClaimRewards](Tx.md#buildclaimrewards)
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

[sdk/src/tx/tx.ts:44](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L44)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:44](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L44)

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

[sdk/src/tx/tx.ts:285](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L285)

___

### buildBatch

▸ **buildBatch**(`txs`): `TxMsgValue`

Build a batched transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txs` | `TxMsgValue`[] | array of TxProp |

#### Returns

`TxMsgValue`

a serialized TxMsgValue type

#### Defined in

[sdk/src/tx/tx.ts:268](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L268)

___

### buildBond

▸ **buildBond**(`wrapperTxProps`, `bondProps`): `Promise`\<`TxMsgValue`\>

Build Bond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `bondProps` | `BondMsgValue` | properties of the bond tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:90](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L90)

___

### buildClaimRewards

▸ **buildClaimRewards**(`wrapperTxProps`, `claimRewardsProps`): `Promise`\<`TxMsgValue`\>

Build Claim Rewards Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `claimRewardsProps` | `ClaimRewardsMsgValue` | properties of the claim rewards tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:247](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L247)

___

### buildEthBridgeTransfer

▸ **buildEthBridgeTransfer**(`wrapperTxProps`, `ethBridgeTransferProps`): `Promise`\<`TxMsgValue`\>

Build Ethereum Bridge Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ethBridgeTransferProps` | `EthBridgeTransferMsgValue` | properties of the eth bridge transfer tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:200](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L200)

___

### buildIbcTransfer

▸ **buildIbcTransfer**(`wrapperTxProps`, `ibcTransferProps`): `Promise`\<`TxMsgValue`\>

Build Ibc Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `ibcTransferProps` | `IbcTransferMsgValue` | properties of the ibc transfer tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:177](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L177)

___

### buildRedelegate

▸ **buildRedelegate**(`wrapperTxProps`, `redelegateProps`): `Promise`\<`TxMsgValue`\>

Build Redelegate Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `redelegateProps` | `RedelegateMsgValue` | properties of the redelegate tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:154](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L154)

___

### buildRevealPk

▸ **buildRevealPk**(`wrapperTxProps`): `Promise`\<`TxMsgValue`\>

Build RevealPK Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:77](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L77)

___

### buildTransparentTransfer

▸ **buildTransparentTransfer**(`wrapperTxProps`, `transferProps`): `Promise`\<`TxMsgValue`\>

Build Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `transferProps` | `TransparentTransferMsgValue` | properties of the transfer |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:53](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L53)

___

### buildUnbond

▸ **buildUnbond**(`wrapperTxProps`, `unbondProps`): `Promise`\<`TxMsgValue`\>

Build Unbond Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `unbondProps` | `UnbondMsgValue` | properties of the unbond tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:111](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L111)

___

### buildVoteProposal

▸ **buildVoteProposal**(`wrapperTxProps`, `voteProposalProps`): `Promise`\<`TxMsgValue`\>

Build Vote Proposal Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `voteProposalProps` | `VoteProposalMsgValue` | properties of the vote proposal tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:223](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L223)

___

### buildWithdraw

▸ **buildWithdraw**(`wrapperTxProps`, `withdrawProps`): `Promise`\<`TxMsgValue`\>

Build Withdraw Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `withdrawProps` | `WithdrawMsgValue` | properties of the withdraw tx |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:133](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L133)

___

### deserialize

▸ **deserialize**(`txBytes`, `checksums`): `TxDetails`

Method to retrieve JSON strings for all commitments of a Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txBytes` | `Uint8Array` | Bytes of a transaction |
| `checksums` | `Record`\<`string`, `string`\> | Record of paths mapped to their respective hashes |

#### Returns

`TxDetails`

a TxDetails object

#### Defined in

[sdk/src/tx/tx.ts:338](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L338)

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

[sdk/src/tx/tx.ts:326](https://github.com/anoma/namada-interface/blob/48e796bf/packages/sdk/src/tx/tx.ts#L326)

[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Tx

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
- [buildShieldedTransfer](Tx.md#buildshieldedtransfer)
- [buildShieldingTransfer](Tx.md#buildshieldingtransfer)
- [buildTransparentTransfer](Tx.md#buildtransparenttransfer)
- [buildUnbond](Tx.md#buildunbond)
- [buildUnshieldingTransfer](Tx.md#buildunshieldingtransfer)
- [buildVoteProposal](Tx.md#buildvoteproposal)
- [buildWithdraw](Tx.md#buildwithdraw)
- [deserialize](Tx.md#deserialize)
- [encodeTxArgs](Tx.md#encodetxargs)
- [getInnerTxHashes](Tx.md#getinnertxhashes)

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

[sdk/src/tx/tx.ts:55](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L55)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:55](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L55)

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

[sdk/src/tx/tx.ts:371](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L371)

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

[sdk/src/tx/tx.ts:354](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L354)

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

[sdk/src/tx/tx.ts:176](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L176)

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

[sdk/src/tx/tx.ts:333](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L333)

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

[sdk/src/tx/tx.ts:286](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L286)

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

[sdk/src/tx/tx.ts:263](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L263)

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

[sdk/src/tx/tx.ts:240](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L240)

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

[sdk/src/tx/tx.ts:163](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L163)

___

### buildShieldedTransfer

▸ **buildShieldedTransfer**(`wrapperTxProps`, `shieldedTransferProps`): `Promise`\<`TxMsgValue`\>

Build Shielded Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `shieldedTransferProps` | `ShieldedTransferMsgValue` | properties of the shielded transfer |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:89](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L89)

___

### buildShieldingTransfer

▸ **buildShieldingTransfer**(`wrapperTxProps`, `shieldingTransferProps`): `Promise`\<`TxMsgValue`\>

Build Shielding Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `shieldingTransferProps` | `ShieldingTransferMsgValue` | properties of the shielding transfer |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:114](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L114)

___

### buildTransparentTransfer

▸ **buildTransparentTransfer**(`wrapperTxProps`, `transferProps`): `Promise`\<`TxMsgValue`\>

Build Transparent Transfer Tx

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

[sdk/src/tx/tx.ts:64](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L64)

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

[sdk/src/tx/tx.ts:197](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L197)

___

### buildUnshieldingTransfer

▸ **buildUnshieldingTransfer**(`wrapperTxProps`, `unshieldingTransferProps`): `Promise`\<`TxMsgValue`\>

Build Unshielding Transfer Tx

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxProps` | `WrapperTxMsgValue` | properties of the transaction |
| `unshieldingTransferProps` | `UnshieldingTransferMsgValue` | properties of the unshielding transfer |

#### Returns

`Promise`\<`TxMsgValue`\>

promise that resolves to an TxMsgValue

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:139](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L139)

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

[sdk/src/tx/tx.ts:309](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L309)

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

[sdk/src/tx/tx.ts:219](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L219)

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

[sdk/src/tx/tx.ts:424](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L424)

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

[sdk/src/tx/tx.ts:412](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L412)

___

### getInnerTxHashes

▸ **getInnerTxHashes**(`bytes`): `string`[]

Return the inner tx hashes from the provided tx bytes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bytes` | `Uint8Array` | Uint8Array |

#### Returns

`string`[]

array of inner Tx hashes

#### Defined in

[sdk/src/tx/tx.ts:480](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/tx/tx.ts#L480)

[@namada/sdk](../README.md) / [Exports](../modules.md) / Tx

# Class: Tx

SDK functionality related to transactions

## Table of contents

### Constructors

- [constructor](Tx.md#constructor)

### Properties

- [sdk](Tx.md#sdk)

### Methods

- [appendMaspSignature](Tx.md#appendmaspsignature)
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
- [generateIbcShieldingMemo](Tx.md#generateibcshieldingmemo)
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

[sdk/src/tx/tx.ts:56](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L56)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/tx/tx.ts:56](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L56)

## Methods

### appendMaspSignature

▸ **appendMaspSignature**(`txBytes`, `signingData`, `signature`): `Uint8Array`

Append signature for transactions signed by Ledger Hardware Wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txBytes` | `Uint8Array` | bytes of the transaction |
| `signingData` | `Uint8Array`[] | signing data |
| `signature` | `Uint8Array` | masp signature |

#### Returns

`Uint8Array`

transaction bytes with signature appended

#### Defined in

[sdk/src/tx/tx.ts:376](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L376)

___

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

[sdk/src/tx/tx.ts:390](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L390)

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

[sdk/src/tx/tx.ts:358](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L358)

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

[sdk/src/tx/tx.ts:178](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L178)

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

[sdk/src/tx/tx.ts:337](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L337)

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

[sdk/src/tx/tx.ts:290](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L290)

___

### buildIbcTransfer

▸ **buildIbcTransfer**(`wrapperTxProps`, `ibcTransferProps`): `Promise`\<`TxMsgValue`\>

Build Ibc Transfer Tx
`ibcTransferProps.amountInBaseDenom` is the amount in the **base** denom
e.g. the value of 1 NAM should be BigNumber(1_000_000), not BigNumber(1).

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

[sdk/src/tx/tx.ts:267](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L267)

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

[sdk/src/tx/tx.ts:242](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L242)

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

[sdk/src/tx/tx.ts:165](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L165)

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

[sdk/src/tx/tx.ts:90](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L90)

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

[sdk/src/tx/tx.ts:115](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L115)

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

[sdk/src/tx/tx.ts:65](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L65)

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

[sdk/src/tx/tx.ts:199](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L199)

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

[sdk/src/tx/tx.ts:141](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L141)

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

[sdk/src/tx/tx.ts:313](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L313)

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

[sdk/src/tx/tx.ts:221](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L221)

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

[sdk/src/tx/tx.ts:443](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L443)

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

[sdk/src/tx/tx.ts:431](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L431)

___

### generateIbcShieldingMemo

▸ **generateIbcShieldingMemo**(`target`, `token`, `amount`, `channelId`): `Promise`\<`string`\>

Generate the memo needed for performing an IBC transfer to a Namada shielded
address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `target` | `string` | the Namada shielded address to send tokens to |
| `token` | `string` | the token to transfer |
| `amount` | `BigNumber` | the amount to transfer |
| `channelId` | `string` | the IBC channel ID on the Namada side |

#### Returns

`Promise`\<`string`\>

promise that resolves to the shielding memo

**`Async`**

#### Defined in

[sdk/src/tx/tx.ts:510](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L510)

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

[sdk/src/tx/tx.ts:529](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/tx/tx.ts#L529)

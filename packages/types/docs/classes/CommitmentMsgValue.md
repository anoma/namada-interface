[@namada/types](../README.md) / [Exports](../modules.md) / CommitmentMsgValue

# Class: CommitmentMsgValue

## Table of contents

### Constructors

- [constructor](CommitmentMsgValue.md#constructor)

### Properties

- [data](CommitmentMsgValue.md#data)
- [hash](CommitmentMsgValue.md#hash)
- [maspTxIn](CommitmentMsgValue.md#masptxin)
- [maspTxOut](CommitmentMsgValue.md#masptxout)
- [memo](CommitmentMsgValue.md#memo)
- [txCodeId](CommitmentMsgValue.md#txcodeid)
- [txType](CommitmentMsgValue.md#txtype)

## Constructors

### constructor

• **new CommitmentMsgValue**(`data`): [`CommitmentMsgValue`](CommitmentMsgValue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`CommitmentMsgValue`](CommitmentMsgValue.md) |

#### Returns

[`CommitmentMsgValue`](CommitmentMsgValue.md)

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:57](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L57)

## Properties

### data

• **data**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:46](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L46)

___

### hash

• **hash**: `string`

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:40](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L40)

___

### maspTxIn

• `Optional` **maspTxIn**: [`MaspTxIn`](MaspTxIn.md)[]

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:52](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L52)

___

### maspTxOut

• `Optional` **maspTxOut**: [`MaspTxOut`](MaspTxOut.md)[]

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:55](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L55)

___

### memo

• `Optional` **memo**: `string`

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L49)

___

### txCodeId

• **txCodeId**: `string`

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:43](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L43)

___

### txType

• **txType**: `number`

#### Defined in

[packages/types/src/tx/schema/txDetails.ts:37](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/txDetails.ts#L37)

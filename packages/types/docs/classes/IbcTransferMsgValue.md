[@namada/types](../README.md) / [Exports](../modules.md) / IbcTransferMsgValue

# Class: IbcTransferMsgValue

## Table of contents

### Constructors

- [constructor](IbcTransferMsgValue.md#constructor)

### Properties

- [amountInBaseDenom](IbcTransferMsgValue.md#amountinbasedenom)
- [bparams](IbcTransferMsgValue.md#bparams)
- [channelId](IbcTransferMsgValue.md#channelid)
- [gasSpendingKey](IbcTransferMsgValue.md#gasspendingkey)
- [memo](IbcTransferMsgValue.md#memo)
- [portId](IbcTransferMsgValue.md#portid)
- [receiver](IbcTransferMsgValue.md#receiver)
- [refundTarget](IbcTransferMsgValue.md#refundtarget)
- [shieldingData](IbcTransferMsgValue.md#shieldingdata)
- [source](IbcTransferMsgValue.md#source)
- [timeoutHeight](IbcTransferMsgValue.md#timeoutheight)
- [timeoutSecOffset](IbcTransferMsgValue.md#timeoutsecoffset)
- [token](IbcTransferMsgValue.md#token)

## Constructors

### constructor

• **new IbcTransferMsgValue**(`data`): [`IbcTransferMsgValue`](IbcTransferMsgValue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`IbcTransferMsgValue`](IbcTransferMsgValue.md) |

#### Returns

[`IbcTransferMsgValue`](IbcTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:53](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L53)

## Properties

### amountInBaseDenom

• **amountInBaseDenom**: `BigNumber`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:24](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L24)

___

### bparams

• `Optional` **bparams**: [`BparamsMsgValue`](BparamsMsgValue.md)[]

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:48](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L48)

___

### channelId

• **channelId**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:30](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L30)

___

### gasSpendingKey

• `Optional` **gasSpendingKey**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:45](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L45)

___

### memo

• `Optional` **memo**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:39](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L39)

___

### portId

• **portId**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:27](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L27)

___

### receiver

• **receiver**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:18](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L18)

___

### refundTarget

• `Optional` **refundTarget**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:51](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L51)

___

### shieldingData

• `Optional` **shieldingData**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L42)

___

### source

• **source**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:15](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L15)

___

### timeoutHeight

• `Optional` **timeoutHeight**: `bigint`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:33](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L33)

___

### timeoutSecOffset

• `Optional` **timeoutSecOffset**: `bigint`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:36](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L36)

___

### token

• **token**: `string`

#### Defined in

[packages/types/src/tx/schema/ibcTransfer.ts:21](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/ibcTransfer.ts#L21)

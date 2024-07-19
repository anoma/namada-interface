[@namada/types](../README.md) / [Exports](../modules.md) / IbcTransferMsgValue

# Class: IbcTransferMsgValue

## Table of contents

### Constructors

- [constructor](IbcTransferMsgValue.md#constructor)

### Properties

- [amount](IbcTransferMsgValue.md#amount)
- [channelId](IbcTransferMsgValue.md#channelid)
- [memo](IbcTransferMsgValue.md#memo)
- [portId](IbcTransferMsgValue.md#portid)
- [receiver](IbcTransferMsgValue.md#receiver)
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

[tx/schema/ibcTransfer.ts:35](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L35)

## Properties

### amount

• **amount**: `BigNumber`

#### Defined in

[tx/schema/ibcTransfer.ts:18](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L18)

___

### channelId

• **channelId**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:24](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L24)

___

### memo

• `Optional` **memo**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:33](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L33)

___

### portId

• **portId**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:21](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L21)

___

### receiver

• **receiver**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:12](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L12)

___

### source

• **source**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:9](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L9)

___

### timeoutHeight

• `Optional` **timeoutHeight**: `bigint`

#### Defined in

[tx/schema/ibcTransfer.ts:27](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L27)

___

### timeoutSecOffset

• `Optional` **timeoutSecOffset**: `bigint`

#### Defined in

[tx/schema/ibcTransfer.ts:30](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L30)

___

### token

• **token**: `string`

#### Defined in

[tx/schema/ibcTransfer.ts:15](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/tx/schema/ibcTransfer.ts#L15)

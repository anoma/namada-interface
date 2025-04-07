[@namada/types](../README.md) / [Exports](../modules.md) / IMessage

# Interface: IMessage\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Schema`](../modules.md#schema) |

## Implemented by

- [`Message`](../classes/Message.md)

## Table of contents

### Methods

- [encode](IMessage.md#encode)

## Methods

### encode

▸ **encode**(`value`): `Uint8Array`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

`Uint8Array`

#### Defined in

[packages/types/src/tx/messages/index.ts:5](https://github.com/anoma/namada-interface/blob/789e785c74e4f6d9560d65f2f0f63787beddc028/packages/types/src/tx/messages/index.ts#L5)

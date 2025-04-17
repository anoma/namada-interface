[@namada/types](../README.md) / [Exports](../modules.md) / Message

# Class: Message\<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Schema`](../modules.md#schema) |

## Implements

- [`IMessage`](../interfaces/IMessage.md)\<`T`\>

## Table of contents

### Constructors

- [constructor](Message.md#constructor)

### Methods

- [encode](Message.md#encode)
- [decode](Message.md#decode)

## Constructors

### constructor

• **new Message**\<`T`\>(): [`Message`](Message.md)\<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Schema`](../modules.md#schema) |

#### Returns

[`Message`](Message.md)\<`T`\>

## Methods

### encode

▸ **encode**(`value`): `Uint8Array`

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

`Uint8Array`

#### Implementation of

[IMessage](../interfaces/IMessage.md).[encode](../interfaces/IMessage.md#encode)

#### Defined in

[packages/types/src/tx/messages/index.ts:9](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/messages/index.ts#L9)

___

### decode

▸ **decode**\<`T`\>(`buffer`, `parser`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Schema`](../modules.md#schema) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `buffer` | `Uint8Array` |
| `parser` | `Constructor`\<`T`\> |

#### Returns

`T`

#### Defined in

[packages/types/src/tx/messages/index.ts:18](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/messages/index.ts#L18)

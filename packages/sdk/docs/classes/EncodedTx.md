[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / EncodedTx

# Class: EncodedTx

Wrap results of tx building along with TxMsg

## Table of contents

### Constructors

- [constructor](EncodedTx.md#constructor)

### Properties

- [tx](EncodedTx.md#tx)
- [txMsg](EncodedTx.md#txmsg)

### Methods

- [free](EncodedTx.md#free)
- [hash](EncodedTx.md#hash)
- [toBytes](EncodedTx.md#tobytes)

## Constructors

### constructor

• **new EncodedTx**(`txMsg`, `tx`): [`EncodedTx`](EncodedTx.md)

Create an EncodedTx class

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txMsg` | `Uint8Array` | Borsh-serialized transaction |
| `tx` | [`BuiltTx`](BuiltTx.md) | Specific tx struct instance |

#### Returns

[`EncodedTx`](EncodedTx.md)

#### Defined in

[sdk/src/tx/types.ts:12](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L12)

## Properties

### tx

• `Readonly` **tx**: [`BuiltTx`](BuiltTx.md)

Specific tx struct instance

#### Defined in

[sdk/src/tx/types.ts:14](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L14)

___

### txMsg

• `Readonly` **txMsg**: `Uint8Array`

Borsh-serialized transaction

#### Defined in

[sdk/src/tx/types.ts:13](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L13)

## Methods

### free

▸ **free**(): `void`

Clear tx bytes resource

#### Returns

`void`

#### Defined in

[sdk/src/tx/types.ts:39](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L39)

___

### hash

▸ **hash**(): `string`

Return the inner Tx hash of the built Tx

#### Returns

`string`

string of tx hash

#### Defined in

[sdk/src/tx/types.ts:32](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L32)

___

### toBytes

▸ **toBytes**(): `Uint8Array`

Return serialized tx bytes for external signing. This will clear
the BuiltTx struct instance from wasm memory, then return the bytes.

#### Returns

`Uint8Array`

Serialized tx bytes

#### Defined in

[sdk/src/tx/types.ts:22](https://github.com/anoma/namada-interface/blob/13677070/packages/sdk/src/tx/types.ts#L22)

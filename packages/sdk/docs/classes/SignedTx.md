[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / SignedTx

# Class: SignedTx

Wrap results of tx signing to simplify passing between Sdk functions

## Table of contents

### Constructors

- [constructor](SignedTx.md#constructor)

### Properties

- [tx](SignedTx.md#tx)
- [txMsg](SignedTx.md#txmsg)

## Constructors

### constructor

• **new SignedTx**(`txMsg`, `tx`): [`SignedTx`](SignedTx.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txMsg` | `Uint8Array` | Serialized tx msg bytes |
| `tx` | `Uint8Array` | Serialized tx bytes |

#### Returns

[`SignedTx`](SignedTx.md)

#### Defined in

[sdk/src/tx/types.ts:52](https://github.com/anoma/namada-interface/blob/1ed4d128/packages/sdk/src/tx/types.ts#L52)

## Properties

### tx

• `Readonly` **tx**: `Uint8Array`

Serialized tx bytes

#### Defined in

[sdk/src/tx/types.ts:56](https://github.com/anoma/namada-interface/blob/1ed4d128/packages/sdk/src/tx/types.ts#L56)

___

### txMsg

• `Readonly` **txMsg**: `Uint8Array`

Serialized tx msg bytes

#### Defined in

[sdk/src/tx/types.ts:54](https://github.com/anoma/namada-interface/blob/1ed4d128/packages/sdk/src/tx/types.ts#L54)

[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / SignedTx

# Class: SignedTx

Wrap results of tx signing to simplify passing between Sdk functions

## Table of contents

### Constructors

- [constructor](SignedTx.md#constructor)

### Properties

- [tx](SignedTx.md#tx)
- [wrapperTxMsg](SignedTx.md#wrappertxmsg)

## Constructors

### constructor

• **new SignedTx**(`wrapperTxMsg`, `tx`): [`SignedTx`](SignedTx.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `wrapperTxMsg` | `Uint8Array` | Serialized wrapper tx msg bytes |
| `tx` | `Uint8Array` | Serialized tx bytes |

#### Returns

[`SignedTx`](SignedTx.md)

#### Defined in

[sdk/src/tx/types.ts:52](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/tx/types.ts#L52)

## Properties

### tx

• `Readonly` **tx**: `Uint8Array`

Serialized tx bytes

#### Defined in

[sdk/src/tx/types.ts:56](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/tx/types.ts#L56)

___

### wrapperTxMsg

• `Readonly` **wrapperTxMsg**: `Uint8Array`

Serialized wrapper tx msg bytes

#### Defined in

[sdk/src/tx/types.ts:54](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/tx/types.ts#L54)

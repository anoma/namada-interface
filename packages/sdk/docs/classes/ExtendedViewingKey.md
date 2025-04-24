[@namada/sdk](../README.md) / [Exports](../modules.md) / ExtendedViewingKey

# Class: ExtendedViewingKey

Wrap ExtendedViewingKey

## Table of contents

### Constructors

- [constructor](ExtendedViewingKey.md#constructor)

### Methods

- [default\_payment\_address](ExtendedViewingKey.md#default_payment_address)
- [encode](ExtendedViewingKey.md#encode)
- [free](ExtendedViewingKey.md#free)

## Constructors

### constructor

• **new ExtendedViewingKey**(`key`): [`ExtendedViewingKey`](ExtendedViewingKey.md)

Instantiate ExtendedViewingKey from serialized vector

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `Uint8Array` |

#### Returns

[`ExtendedViewingKey`](ExtendedViewingKey.md)

#### Defined in

shared/src/shared/shared.d.ts:81

## Methods

### default\_payment\_address

▸ **default_payment_address**(): `any`

#### Returns

`any`

#### Defined in

shared/src/shared/shared.d.ts:86

___

### encode

▸ **encode**(): `string`

Return ExtendedViewingKey as Bech32-encoded String

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:85

___

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:77

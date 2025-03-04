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

shared/src/shared/shared.d.ts:135

## Methods

### default\_payment\_address

▸ **default_payment_address**(): `PaymentAddress`

#### Returns

`PaymentAddress`

#### Defined in

shared/src/shared/shared.d.ts:144

___

### encode

▸ **encode**(): `string`

Return ExtendedViewingKey as Bech32-encoded String

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:140

___

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:130

[@namada/sdk](../README.md) / [Exports](../modules.md) / PseudoExtendedKey

# Class: PseudoExtendedKey

Wrap ExtendedSpendingKey

## Table of contents

### Constructors

- [constructor](PseudoExtendedKey.md#constructor)

### Methods

- [encode](PseudoExtendedKey.md#encode)
- [free](PseudoExtendedKey.md#free)
- [decode](PseudoExtendedKey.md#decode)
- [from](PseudoExtendedKey.md#from)

## Constructors

### constructor

• **new PseudoExtendedKey**(): [`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Returns

[`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Defined in

shared/src/shared/shared.d.ts:136

## Methods

### encode

▸ **encode**(): `string`

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:138

___

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:137

___

### decode

▸ **decode**(`encoded`): [`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoded` | `string` |

#### Returns

[`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Defined in

shared/src/shared/shared.d.ts:139

___

### from

▸ **from**(`xvk`, `pgk`): [`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `xvk` | [`ExtendedViewingKey`](ExtendedViewingKey.md) |
| `pgk` | [`ProofGenerationKey`](ProofGenerationKey.md) |

#### Returns

[`PseudoExtendedKey`](PseudoExtendedKey.md)

#### Defined in

shared/src/shared/shared.d.ts:140

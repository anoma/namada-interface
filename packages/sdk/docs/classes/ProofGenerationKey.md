[@namada/sdk](../README.md) / [Exports](../modules.md) / ProofGenerationKey

# Class: ProofGenerationKey

## Table of contents

### Constructors

- [constructor](ProofGenerationKey.md#constructor)

### Methods

- [encode](ProofGenerationKey.md#encode)
- [free](ProofGenerationKey.md#free)
- [decode](ProofGenerationKey.md#decode)
- [from\_bytes](ProofGenerationKey.md#from_bytes)

## Constructors

### constructor

• **new ProofGenerationKey**(): [`ProofGenerationKey`](ProofGenerationKey.md)

#### Returns

[`ProofGenerationKey`](ProofGenerationKey.md)

#### Defined in

shared/src/shared/shared.d.ts:126

## Methods

### encode

▸ **encode**(): `string`

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:129

___

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:127

___

### decode

▸ **decode**(`encoded`): [`ProofGenerationKey`](ProofGenerationKey.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `encoded` | `string` |

#### Returns

[`ProofGenerationKey`](ProofGenerationKey.md)

#### Defined in

shared/src/shared/shared.d.ts:130

___

### from\_bytes

▸ **from_bytes**(`ak`, `nsk`): [`ProofGenerationKey`](ProofGenerationKey.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `ak` | `Uint8Array` |
| `nsk` | `Uint8Array` |

#### Returns

[`ProofGenerationKey`](ProofGenerationKey.md)

#### Defined in

shared/src/shared/shared.d.ts:128

[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / BuiltTx

# Class: BuiltTx

## Table of contents

### Constructors

- [constructor](BuiltTx.md#constructor)

### Methods

- [free](BuiltTx.md#free)
- [signing\_data\_bytes](BuiltTx.md#signing_data_bytes)
- [tx\_bytes](BuiltTx.md#tx_bytes)
- [tx\_hash](BuiltTx.md#tx_hash)
- [tx\_type](BuiltTx.md#tx_type)

## Constructors

### constructor

• **new BuiltTx**(`tx_type`, `tx_bytes`, `signing_data_bytes`): [`BuiltTx`](BuiltTx.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tx_type` | [`TxType`](../enums/TxType.md) |
| `tx_bytes` | `Uint8Array` |
| `signing_data_bytes` | `Uint8Array` |

#### Returns

[`BuiltTx`](BuiltTx.md)

#### Defined in

shared/src/shared/shared.d.ts:89

## Methods

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:83

___

### signing\_data\_bytes

▸ **signing_data_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:101

___

### tx\_bytes

▸ **tx_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:93

___

### tx\_hash

▸ **tx_hash**(): `string`

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:97

___

### tx\_type

▸ **tx_type**(): [`TxType`](../enums/TxType.md)

#### Returns

[`TxType`](../enums/TxType.md)

#### Defined in

shared/src/shared/shared.d.ts:105

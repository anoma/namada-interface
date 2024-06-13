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
- [tx\_hashes](BuiltTx.md#tx_hashes)
- [tx\_type](BuiltTx.md#tx_type)
- [wrapper\_tx\_msg](BuiltTx.md#wrapper_tx_msg)

## Constructors

### constructor

• **new BuiltTx**(`tx_type`, `tx_bytes`, `signing_data_bytes`, `wrapper_tx_msg`): [`BuiltTx`](BuiltTx.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tx_type` | [`TxType`](../enums/TxType.md) |
| `tx_bytes` | `Uint8Array` |
| `signing_data_bytes` | `Uint8Array` |
| `wrapper_tx_msg` | `Uint8Array` |

#### Returns

[`BuiltTx`](BuiltTx.md)

#### Defined in

shared/src/shared/shared.d.ts:64

## Methods

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:57

___

### signing\_data\_bytes

▸ **signing_data_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:80

___

### tx\_bytes

▸ **tx_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:68

___

### tx\_hash

▸ **tx_hash**(): `string`

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:72

___

### tx\_hashes

▸ **tx_hashes**(): `string`[]

#### Returns

`string`[]

#### Defined in

shared/src/shared/shared.d.ts:76

___

### tx\_type

▸ **tx_type**(): [`TxType`](../enums/TxType.md)

#### Returns

[`TxType`](../enums/TxType.md)

#### Defined in

shared/src/shared/shared.d.ts:84

___

### wrapper\_tx\_msg

▸ **wrapper_tx_msg**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:88

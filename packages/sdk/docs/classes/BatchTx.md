[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / BatchTx

# Class: BatchTx

## Table of contents

### Constructors

- [constructor](BatchTx.md#constructor)

### Methods

- [free](BatchTx.md#free)
- [tx\_bytes](BatchTx.md#tx_bytes)
- [tx\_hash](BatchTx.md#tx_hash)
- [tx\_hashes](BatchTx.md#tx_hashes)
- [tx\_type](BatchTx.md#tx_type)
- [txs](BatchTx.md#txs)

## Constructors

### constructor

• **new BatchTx**(`tx_type`, `tx_bytes`, `txs`): [`BatchTx`](BatchTx.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `tx_type` | [`TxType`](../enums/TxType.md) |
| `tx_bytes` | `Uint8Array` |
| `txs` | [`BuiltTx`](BuiltTx.md)[] |

#### Returns

[`BatchTx`](BatchTx.md)

#### Defined in

shared/src/shared/shared.d.ts:58

## Methods

### free

▸ **free**(): `void`

#### Returns

`void`

#### Defined in

shared/src/shared/shared.d.ts:52

___

### tx\_bytes

▸ **tx_bytes**(): `Uint8Array`

#### Returns

`Uint8Array`

#### Defined in

shared/src/shared/shared.d.ts:62

___

### tx\_hash

▸ **tx_hash**(): `string`

#### Returns

`string`

#### Defined in

shared/src/shared/shared.d.ts:66

___

### tx\_hashes

▸ **tx_hashes**(): `string`[]

#### Returns

`string`[]

#### Defined in

shared/src/shared/shared.d.ts:74

___

### tx\_type

▸ **tx_type**(): [`TxType`](../enums/TxType.md)

#### Returns

[`TxType`](../enums/TxType.md)

#### Defined in

shared/src/shared/shared.d.ts:78

___

### txs

▸ **txs**(): [`BuiltTx`](BuiltTx.md)[]

#### Returns

[`BuiltTx`](BuiltTx.md)[]

#### Defined in

shared/src/shared/shared.d.ts:70

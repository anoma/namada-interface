[@namada/types](../README.md) / [Exports](../modules.md) / SigningDataMsgValue

# Class: SigningDataMsgValue

## Table of contents

### Constructors

- [constructor](SigningDataMsgValue.md#constructor)

### Properties

- [accountPublicKeysMap](SigningDataMsgValue.md#accountpublickeysmap)
- [feePayer](SigningDataMsgValue.md#feepayer)
- [masp](SigningDataMsgValue.md#masp)
- [owner](SigningDataMsgValue.md#owner)
- [publicKeys](SigningDataMsgValue.md#publickeys)
- [shieldedHash](SigningDataMsgValue.md#shieldedhash)
- [threshold](SigningDataMsgValue.md#threshold)

## Constructors

### constructor

• **new SigningDataMsgValue**(`data`): [`SigningDataMsgValue`](SigningDataMsgValue.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | [`SigningDataMsgValue`](SigningDataMsgValue.md) |

#### Returns

[`SigningDataMsgValue`](SigningDataMsgValue.md)

#### Defined in

[packages/types/src/tx/schema/tx.ts:32](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L32)

## Properties

### accountPublicKeysMap

• `Optional` **accountPublicKeysMap**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/tx.ts:21](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L21)

___

### feePayer

• **feePayer**: `string`

#### Defined in

[packages/types/src/tx/schema/tx.ts:24](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L24)

___

### masp

• `Optional` **masp**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/tx.ts:30](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L30)

___

### owner

• `Optional` **owner**: `string`

#### Defined in

[packages/types/src/tx/schema/tx.ts:8](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L8)

___

### publicKeys

• **publicKeys**: `string`[]

#### Defined in

[packages/types/src/tx/schema/tx.ts:11](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L11)

___

### shieldedHash

• `Optional` **shieldedHash**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/tx.ts:27](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L27)

___

### threshold

• **threshold**: `number`

#### Defined in

[packages/types/src/tx/schema/tx.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/tx.ts#L14)

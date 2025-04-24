[@namada/types](../README.md) / [Exports](../modules.md) / TransferMsgValue

# Class: TransferMsgValue

Used only for serializing transfers during build

## Table of contents

### Constructors

- [constructor](TransferMsgValue.md#constructor)

### Properties

- [shieldedSectionHash](TransferMsgValue.md#shieldedsectionhash)
- [sources](TransferMsgValue.md#sources)
- [targets](TransferMsgValue.md#targets)

## Constructors

### constructor

• **new TransferMsgValue**(): [`TransferMsgValue`](TransferMsgValue.md)

#### Returns

[`TransferMsgValue`](TransferMsgValue.md)

## Properties

### shieldedSectionHash

• `Optional` **shieldedSectionHash**: `Uint8Array`

#### Defined in

[packages/types/src/tx/schema/transfer.ts:225](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/transfer.ts#L225)

___

### sources

• **sources**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[packages/types/src/tx/schema/transfer.ts:219](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/transfer.ts#L219)

___

### targets

• **targets**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[packages/types/src/tx/schema/transfer.ts:222](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/transfer.ts#L222)

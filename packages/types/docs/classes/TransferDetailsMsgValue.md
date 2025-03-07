[@namada/types](../README.md) / [Exports](../modules.md) / TransferDetailsMsgValue

# Class: TransferDetailsMsgValue

When deserializing for Transfer Details, return version with
shieldedSectionHash encoded as hex instead of Uint8Array

## Table of contents

### Constructors

- [constructor](TransferDetailsMsgValue.md#constructor)

### Properties

- [shieldedSectionHash](TransferDetailsMsgValue.md#shieldedsectionhash)
- [sources](TransferDetailsMsgValue.md#sources)
- [targets](TransferDetailsMsgValue.md#targets)

## Constructors

### constructor

• **new TransferDetailsMsgValue**(): [`TransferDetailsMsgValue`](TransferDetailsMsgValue.md)

#### Returns

[`TransferDetailsMsgValue`](TransferDetailsMsgValue.md)

## Properties

### shieldedSectionHash

• `Optional` **shieldedSectionHash**: `string`

#### Defined in

[tx/schema/transfer.ts:282](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L282)

___

### sources

• **sources**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:276](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L276)

___

### targets

• **targets**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:279](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L279)

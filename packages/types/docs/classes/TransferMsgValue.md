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

[tx/schema/transfer.ts:267](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L267)

___

### sources

• **sources**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:261](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L261)

___

### targets

• **targets**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:264](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/tx/schema/transfer.ts#L264)

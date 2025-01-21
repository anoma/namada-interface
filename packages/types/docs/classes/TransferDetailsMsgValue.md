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

[tx/schema/transfer.ts:205](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L205)

___

### sources

• **sources**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:199](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L199)

___

### targets

• **targets**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:202](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L202)

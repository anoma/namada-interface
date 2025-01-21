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

[tx/schema/transfer.ts:190](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L190)

___

### sources

• **sources**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:184](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L184)

___

### targets

• **targets**: [`TransferDataMsgValue`](TransferDataMsgValue.md)[]

#### Defined in

[tx/schema/transfer.ts:187](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/types/src/tx/schema/transfer.ts#L187)

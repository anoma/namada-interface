[@namada/sdk](../README.md) / [Exports](../modules.md) / Masp

# Class: Masp

Class representing utilities related to MASP

## Table of contents

### Constructors

- [constructor](Masp.md#constructor)

### Properties

- [sdk](Masp.md#sdk)

### Methods

- [addSpendingKey](Masp.md#addspendingkey)
- [fetchAndStoreMaspParams](Masp.md#fetchandstoremaspparams)
- [hasMaspParams](Masp.md#hasmaspparams)
- [loadMaspParams](Masp.md#loadmaspparams)

## Constructors

### constructor

• **new Masp**(`sdk`): [`Masp`](Masp.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sdk` | `Sdk` | Instance of Sdk struct from wasm lib |

#### Returns

[`Masp`](Masp.md)

#### Defined in

[sdk/src/masp.ts:10](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L10)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/masp.ts:10](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L10)

## Methods

### addSpendingKey

▸ **addSpendingKey**(`xsk`, `alias`): `Promise`\<`void`\>

Add spending key to SDK wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `xsk` | `string` | extended spending key |
| `alias` | `string` | alias for the key |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:47](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L47)

___

### fetchAndStoreMaspParams

▸ **fetchAndStoreMaspParams**(): `Promise`\<`void`\>

Fetch MASP parameters and store them in SDK

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:26](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L26)

___

### hasMaspParams

▸ **hasMaspParams**(): `Promise`\<`boolean`\>

Check if SDK has MASP parameters loaded

#### Returns

`Promise`\<`boolean`\>

True if MASP parameters are loaded

**`Async`**

#### Defined in

[sdk/src/masp.ts:17](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L17)

___

### loadMaspParams

▸ **loadMaspParams**(`pathOrDbName`): `Promise`\<`void`\>

Load stored MASP params

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pathOrDbName` | `string` | Path to stored MASP params(nodejs) or name of the database(browser) |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:36](https://github.com/anoma/namada-interface/blob/30129006/packages/sdk/src/masp.ts#L36)

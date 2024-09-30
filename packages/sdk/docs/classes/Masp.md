[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Masp

# Class: Masp

Class representing utilities related to MASP

## Table of contents

### Constructors

- [constructor](Masp.md#constructor)

### Properties

- [sdk](Masp.md#sdk)

### Methods

- [addDefaultPaymentAddress](Masp.md#adddefaultpaymentaddress)
- [addSpendingKey](Masp.md#addspendingkey)
- [addViewingKey](Masp.md#addviewingkey)
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

[sdk/src/masp.ts:10](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L10)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/masp.ts:10](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L10)

## Methods

### addDefaultPaymentAddress

▸ **addDefaultPaymentAddress**(`xvk`, `alias`): `Promise`\<`void`\>

Add payment address to SDK wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `xvk` | `string` | Extended viewing key |
| `alias` | `string` | Alias for the key |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:70](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L70)

___

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

[sdk/src/masp.ts:48](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L48)

___

### addViewingKey

▸ **addViewingKey**(`xvk`, `alias`): `Promise`\<`void`\>

Add viewing key to SDK wallet

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `xvk` | `string` | extended viewing key |
| `alias` | `string` | alias for the key |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:59](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L59)

___

### fetchAndStoreMaspParams

▸ **fetchAndStoreMaspParams**(`url?`): `Promise`\<`void`\>

Fetch MASP parameters and store them in SDK

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url?` | `string` | optional URL to override the default |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp.ts:27](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L27)

___

### hasMaspParams

▸ **hasMaspParams**(): `Promise`\<`boolean`\>

Check if SDK has MASP parameters loaded

#### Returns

`Promise`\<`boolean`\>

True if MASP parameters are loaded

**`Async`**

#### Defined in

[sdk/src/masp.ts:17](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L17)

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

[sdk/src/masp.ts:37](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/masp.ts#L37)

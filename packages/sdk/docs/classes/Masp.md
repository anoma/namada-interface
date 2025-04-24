[@namada/sdk](../README.md) / [Exports](../modules.md) / Masp

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
- [clearShieldedContext](Masp.md#clearshieldedcontext)
- [fetchAndStoreMaspParams](Masp.md#fetchandstoremaspparams)
- [hasMaspParams](Masp.md#hasmaspparams)
- [loadMaspParams](Masp.md#loadmaspparams)
- [maspAddress](Masp.md#maspaddress)

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

[sdk/src/masp/masp.ts:10](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L10)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/masp/masp.ts:10](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L10)

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

[sdk/src/masp/masp.ts:71](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L71)

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

[sdk/src/masp/masp.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L49)

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

[sdk/src/masp/masp.ts:60](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L60)

___

### clearShieldedContext

▸ **clearShieldedContext**(`chainId`): `Promise`\<`void`\>

Clear shilded context

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chainId` | `string` | Chain ID to clear the shielded context for |

#### Returns

`Promise`\<`void`\>

void

#### Defined in

[sdk/src/masp/masp.ts:89](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L89)

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

[sdk/src/masp/masp.ts:27](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L27)

___

### hasMaspParams

▸ **hasMaspParams**(): `Promise`\<`boolean`\>

Check if SDK has MASP parameters loaded

#### Returns

`Promise`\<`boolean`\>

True if MASP parameters are loaded

**`Async`**

#### Defined in

[sdk/src/masp/masp.ts:17](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L17)

___

### loadMaspParams

▸ **loadMaspParams**(`pathOrDbName`, `chainId`): `Promise`\<`void`\>

Load stored MASP params

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `pathOrDbName` | `string` | Path to stored MASP params(nodejs) or name of the database(browser) |
| `chainId` | `string` | Chain ID to read the MASP params for |

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/masp/masp.ts:38](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L38)

___

### maspAddress

▸ **maspAddress**(): `string`

Returns the MASP address used as the receiving address in IBC transfers to
shielded accounts

#### Returns

`string`

the MASP address

#### Defined in

[sdk/src/masp/masp.ts:80](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/masp/masp.ts#L80)

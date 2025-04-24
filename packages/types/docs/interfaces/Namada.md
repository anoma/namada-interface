[@namada/types](../README.md) / [Exports](../modules.md) / Namada

# Interface: Namada

## Table of contents

### Properties

- [version](Namada.md#version)

### Methods

- [accounts](Namada.md#accounts)
- [clearDisposableKeypair](Namada.md#cleardisposablekeypair)
- [connect](Namada.md#connect)
- [defaultAccount](Namada.md#defaultaccount)
- [disconnect](Namada.md#disconnect)
- [genDisposableKeypair](Namada.md#gendisposablekeypair)
- [isConnected](Namada.md#isconnected)
- [persistDisposableKeypair](Namada.md#persistdisposablekeypair)
- [sign](Namada.md#sign)
- [signArbitrary](Namada.md#signarbitrary)
- [updateDefaultAccount](Namada.md#updatedefaultaccount)
- [verify](Namada.md#verify)

## Properties

### version

• **version**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[packages/types/src/namada.ts:54](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L54)

## Methods

### accounts

▸ **accounts**(): `Promise`\<`undefined` \| readonly [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)[]\>

#### Returns

`Promise`\<`undefined` \| readonly [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)[]\>

#### Defined in

[packages/types/src/namada.ts:40](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L40)

___

### clearDisposableKeypair

▸ **clearDisposableKeypair**(`props`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`ClearDisposableSignerProps`](../modules.md#cleardisposablesignerprops) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:53](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L53)

___

### connect

▸ **connect**(`chainId?`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:41](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L41)

___

### defaultAccount

▸ **defaultAccount**(): `Promise`\<`undefined` \| [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)\>

#### Returns

`Promise`\<`undefined` \| [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)\>

#### Defined in

[packages/types/src/namada.ts:44](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L44)

___

### disconnect

▸ **disconnect**(`chainId?`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L42)

___

### genDisposableKeypair

▸ **genDisposableKeypair**(): `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Returns

`Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Defined in

[packages/types/src/namada.ts:51](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L51)

___

### isConnected

▸ **isConnected**(`chainId?`): `Promise`\<`undefined` \| `boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

#### Returns

`Promise`\<`undefined` \| `boolean`\>

#### Defined in

[packages/types/src/namada.ts:43](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L43)

___

### persistDisposableKeypair

▸ **persistDisposableKeypair**(`props`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`PersistDisposableSignerProps`](../modules.md#persistdisposablesignerprops) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:52](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L52)

___

### sign

▸ **sign**(`props`): `Promise`\<`undefined` \| `Uint8Array`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SignProps`](../modules.md#signprops) |

#### Returns

`Promise`\<`undefined` \| `Uint8Array`[]\>

#### Defined in

[packages/types/src/namada.ts:46](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L46)

___

### signArbitrary

▸ **signArbitrary**(`props`): `Promise`\<`undefined` \| [`SignArbitraryResponse`](../modules.md#signarbitraryresponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SignArbitraryProps`](../modules.md#signarbitraryprops) |

#### Returns

`Promise`\<`undefined` \| [`SignArbitraryResponse`](../modules.md#signarbitraryresponse)\>

#### Defined in

[packages/types/src/namada.ts:47](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L47)

___

### updateDefaultAccount

▸ **updateDefaultAccount**(`address`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:45](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L45)

___

### verify

▸ **verify**(`props`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`VerifyArbitraryProps`](../modules.md#verifyarbitraryprops) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/namada.ts:50](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L50)

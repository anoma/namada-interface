[@namada/types](../README.md) / [Exports](../modules.md) / Namada

# Interface: Namada

## Table of contents

### Properties

- [version](Namada.md#version)

### Methods

- [accounts](Namada.md#accounts)
- [connect](Namada.md#connect)
- [defaultAccount](Namada.md#defaultaccount)
- [disconnect](Namada.md#disconnect)
- [genDisposableKeypair](Namada.md#gendisposablekeypair)
- [isConnected](Namada.md#isconnected)
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

[namada.ts:44](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L44)

## Methods

### accounts

▸ **accounts**(): `Promise`\<`undefined` \| readonly [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)[]\>

#### Returns

`Promise`\<`undefined` \| readonly [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)[]\>

#### Defined in

[namada.ts:32](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L32)

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

[namada.ts:33](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L33)

___

### defaultAccount

▸ **defaultAccount**(): `Promise`\<`undefined` \| [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)\>

#### Returns

`Promise`\<`undefined` \| [`NamadaKeychainAccount`](../modules.md#namadakeychainaccount)\>

#### Defined in

[namada.ts:36](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L36)

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

[namada.ts:34](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L34)

___

### genDisposableKeypair

▸ **genDisposableKeypair**(): `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Returns

`Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Defined in

[namada.ts:43](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L43)

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

[namada.ts:35](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L35)

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

[namada.ts:38](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L38)

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

[namada.ts:39](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L39)

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

[namada.ts:37](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L37)

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

[namada.ts:42](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/namada.ts#L42)

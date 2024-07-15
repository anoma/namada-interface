[@namada/types](../README.md) / [Exports](../modules.md) / Namada

# Interface: Namada

## Table of contents

### Properties

- [getChain](Namada.md#getchain)
- [version](Namada.md#version)

### Methods

- [accounts](Namada.md#accounts)
- [connect](Namada.md#connect)
- [defaultAccount](Namada.md#defaultaccount)
- [isConnected](Namada.md#isconnected)
- [sign](Namada.md#sign)
- [signArbitrary](Namada.md#signarbitrary)
- [verify](Namada.md#verify)

## Properties

### getChain

• **getChain**: () => `Promise`\<`undefined` \| [`Chain`](../modules.md#chain)\>

#### Type declaration

▸ (): `Promise`\<`undefined` \| [`Chain`](../modules.md#chain)\>

##### Returns

`Promise`\<`undefined` \| [`Chain`](../modules.md#chain)\>

#### Defined in

[namada.ts:38](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L38)

___

### version

• **version**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[namada.ts:39](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L39)

## Methods

### accounts

▸ **accounts**(`chainId?`): `Promise`\<`undefined` \| [`DerivedAccount`](../modules.md#derivedaccount)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

#### Returns

`Promise`\<`undefined` \| [`DerivedAccount`](../modules.md#derivedaccount)[]\>

#### Defined in

[namada.ts:29](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L29)

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

[namada.ts:30](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L30)

___

### defaultAccount

▸ **defaultAccount**(`chainId?`): `Promise`\<`undefined` \| [`DerivedAccount`](../modules.md#derivedaccount)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

#### Returns

`Promise`\<`undefined` \| [`DerivedAccount`](../modules.md#derivedaccount)\>

#### Defined in

[namada.ts:32](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L32)

___

### isConnected

▸ **isConnected**(): `Promise`\<`undefined` \| `boolean`\>

#### Returns

`Promise`\<`undefined` \| `boolean`\>

#### Defined in

[namada.ts:31](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L31)

___

### sign

▸ **sign**(`props`): `Promise`\<`undefined` \| `Uint8Array`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`SignProps`](../modules.md#signprops) |

#### Returns

`Promise`\<`undefined` \| `Uint8Array`\>

#### Defined in

[namada.ts:33](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L33)

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

[namada.ts:34](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L34)

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

[namada.ts:37](https://github.com/anoma/namada-interface/blob/52e59b9f/packages/types/src/namada.ts#L37)

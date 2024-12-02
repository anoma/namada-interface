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

[namada.ts:39](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L39)

## Methods

### accounts

▸ **accounts**(): `Promise`\<`undefined` \| readonly [`Account`](../modules.md#account)[]\>

#### Returns

`Promise`\<`undefined` \| readonly [`Account`](../modules.md#account)[]\>

#### Defined in

[namada.ts:28](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L28)

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

[namada.ts:29](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L29)

___

### defaultAccount

▸ **defaultAccount**(): `Promise`\<`undefined` \| [`Account`](../modules.md#account)\>

#### Returns

`Promise`\<`undefined` \| [`Account`](../modules.md#account)\>

#### Defined in

[namada.ts:32](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L32)

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

[namada.ts:30](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L30)

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

[namada.ts:31](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L31)

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

[namada.ts:34](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L34)

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

[namada.ts:35](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L35)

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

[namada.ts:33](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L33)

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

[namada.ts:38](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/namada.ts#L38)

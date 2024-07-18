[@namada/types](../README.md) / [Exports](../modules.md) / Namada

# Interface: Namada

## Table of contents

### Properties

- [getChain](Namada.md#getchain)
- [version](Namada.md#version)

### Methods

- [accounts](Namada.md#accounts)
- [addTxWasmHashes](Namada.md#addtxwasmhashes)
- [connect](Namada.md#connect)
- [defaultAccount](Namada.md#defaultaccount)
- [getTxWasmHashes](Namada.md#gettxwasmhashes)
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

[namada.ts:48](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L48)

___

### version

• **version**: () => `string`

#### Type declaration

▸ (): `string`

##### Returns

`string`

#### Defined in

[namada.ts:51](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L51)

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

[namada.ts:39](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L39)

___

### addTxWasmHashes

▸ **addTxWasmHashes**(`props`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`WasmHashProps`](../modules.md#wasmhashprops) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[namada.ts:49](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L49)

___

### connect

▸ **connect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[namada.ts:40](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L40)

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

[namada.ts:42](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L42)

___

### getTxWasmHashes

▸ **getTxWasmHashes**(`chainId`): `Promise`\<`undefined` \| [`WasmHash`](../modules.md#wasmhash)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `chainId` | `string` |

#### Returns

`Promise`\<`undefined` \| [`WasmHash`](../modules.md#wasmhash)[]\>

#### Defined in

[namada.ts:50](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L50)

___

### isConnected

▸ **isConnected**(): `Promise`\<`undefined` \| `boolean`\>

#### Returns

`Promise`\<`undefined` \| `boolean`\>

#### Defined in

[namada.ts:41](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L41)

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

[namada.ts:43](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L43)

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

[namada.ts:44](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L44)

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

[namada.ts:47](https://github.com/anoma/namada-interface/blob/1d7305cb/packages/types/src/namada.ts#L47)

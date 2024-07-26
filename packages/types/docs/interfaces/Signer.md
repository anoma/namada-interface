[@namada/types](../README.md) / [Exports](../modules.md) / Signer

# Interface: Signer

## Table of contents

### Properties

- [accounts](Signer.md#accounts)
- [defaultAccount](Signer.md#defaultaccount)
- [sign](Signer.md#sign)
- [signArbitrary](Signer.md#signarbitrary)
- [verify](Signer.md#verify)

## Properties

### accounts

• **accounts**: (`chainId?`: `string`) => `Promise`\<`undefined` \| [`Account`](../modules.md#account)[]\>

#### Type declaration

▸ (`chainId?`): `Promise`\<`undefined` \| [`Account`](../modules.md#account)[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

##### Returns

`Promise`\<`undefined` \| [`Account`](../modules.md#account)[]\>

#### Defined in

[signer.ts:14](https://github.com/anoma/namada-interface/blob/cebcdd13/packages/types/src/signer.ts#L14)

___

### defaultAccount

• **defaultAccount**: (`chainId?`: `string`) => `Promise`\<`undefined` \| [`Account`](../modules.md#account)\>

#### Type declaration

▸ (`chainId?`): `Promise`\<`undefined` \| [`Account`](../modules.md#account)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `chainId?` | `string` |

##### Returns

`Promise`\<`undefined` \| [`Account`](../modules.md#account)\>

#### Defined in

[signer.ts:15](https://github.com/anoma/namada-interface/blob/cebcdd13/packages/types/src/signer.ts#L15)

___

### sign

• **sign**: (`txType`: `unknown`, `tx`: [`TxData`](../modules.md#txdata), `signer`: `string`, `wrapperTxMsg`: `Uint8Array`, `checksums?`: `Record`\<`string`, `string`\>) => `Promise`\<`undefined` \| `Uint8Array`\>

#### Type declaration

▸ (`txType`, `tx`, `signer`, `wrapperTxMsg`, `checksums?`): `Promise`\<`undefined` \| `Uint8Array`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `txType` | `unknown` |
| `tx` | [`TxData`](../modules.md#txdata) |
| `signer` | `string` |
| `wrapperTxMsg` | `Uint8Array` |
| `checksums?` | `Record`\<`string`, `string`\> |

##### Returns

`Promise`\<`undefined` \| `Uint8Array`\>

#### Defined in

[signer.ts:18](https://github.com/anoma/namada-interface/blob/cebcdd13/packages/types/src/signer.ts#L18)

___

### signArbitrary

• **signArbitrary**: (`signer`: `string`, `data`: `string`) => `Promise`\<`undefined` \| [`SignArbitraryResponse`](../modules.md#signarbitraryresponse)\>

#### Type declaration

▸ (`signer`, `data`): `Promise`\<`undefined` \| [`SignArbitraryResponse`](../modules.md#signarbitraryresponse)\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `signer` | `string` |
| `data` | `string` |

##### Returns

`Promise`\<`undefined` \| [`SignArbitraryResponse`](../modules.md#signarbitraryresponse)\>

#### Defined in

[signer.ts:25](https://github.com/anoma/namada-interface/blob/cebcdd13/packages/types/src/signer.ts#L25)

___

### verify

• **verify**: (`publicKey`: `string`, `hash`: `string`, `signature`: `string`) => `Promise`\<`void`\>

#### Type declaration

▸ (`publicKey`, `hash`, `signature`): `Promise`\<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `publicKey` | `string` |
| `hash` | `string` |
| `signature` | `string` |

##### Returns

`Promise`\<`void`\>

#### Defined in

[signer.ts:29](https://github.com/anoma/namada-interface/blob/cebcdd13/packages/types/src/signer.ts#L29)

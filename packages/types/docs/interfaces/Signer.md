[@namada/types](../README.md) / [Exports](../modules.md) / Signer

# Interface: Signer

## Table of contents

### Properties

- [sign](Signer.md#sign)
- [signArbitrary](Signer.md#signarbitrary)
- [verify](Signer.md#verify)

## Properties

### sign

• **sign**: (`tx`: [`TxMsgValue`](../classes/TxMsgValue.md) \| [`TxMsgValue`](../classes/TxMsgValue.md)[], `signer`: `string`, `checksums?`: `Record`\<`string`, `string`\>) => `Promise`\<`undefined` \| `Uint8Array`[]\>

#### Type declaration

▸ (`tx`, `signer`, `checksums?`): `Promise`\<`undefined` \| `Uint8Array`[]\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `tx` | [`TxMsgValue`](../classes/TxMsgValue.md) \| [`TxMsgValue`](../classes/TxMsgValue.md)[] |
| `signer` | `string` |
| `checksums?` | `Record`\<`string`, `string`\> |

##### Returns

`Promise`\<`undefined` \| `Uint8Array`[]\>

#### Defined in

[signer.ts:9](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/signer.ts#L9)

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

[signer.ts:14](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/signer.ts#L14)

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

[signer.ts:18](https://github.com/anoma/namada-interface/blob/be532c799367420fcc6a8d60ac3b6b3a194f2891/packages/types/src/signer.ts#L18)

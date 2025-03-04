[@namada/types](../README.md) / [Exports](../modules.md) / Signer

# Interface: Signer

## Table of contents

### Properties

- [genDisposableKeypair](Signer.md#gendisposablekeypair)
- [sign](Signer.md#sign)
- [signArbitrary](Signer.md#signarbitrary)
- [verify](Signer.md#verify)

## Properties

### genDisposableKeypair

• **genDisposableKeypair**: () => `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Type declaration

▸ (): `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

##### Returns

`Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Defined in

[signer.ts:24](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/signer.ts#L24)

___

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

[signer.ts:14](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/signer.ts#L14)

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

[signer.ts:19](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/signer.ts#L19)

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

[signer.ts:23](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/types/src/signer.ts#L23)

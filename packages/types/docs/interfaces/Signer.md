[@namada/types](../README.md) / [Exports](../modules.md) / Signer

# Interface: Signer

## Table of contents

### Properties

- [clearDisposableKeypair](Signer.md#cleardisposablekeypair)
- [genDisposableKeypair](Signer.md#gendisposablekeypair)
- [persistDisposableKeypair](Signer.md#persistdisposablekeypair)
- [sign](Signer.md#sign)
- [signArbitrary](Signer.md#signarbitrary)
- [verify](Signer.md#verify)

## Properties

### clearDisposableKeypair

• **clearDisposableKeypair**: (`address`: `string`) => `Promise`\<`void`\>

#### Type declaration

▸ (`address`): `Promise`\<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

##### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/signer.ts:26](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L26)

___

### genDisposableKeypair

• **genDisposableKeypair**: () => `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Type declaration

▸ (): `Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

##### Returns

`Promise`\<`undefined` \| [`GenDisposableSignerResponse`](../modules.md#gendisposablesignerresponse)\>

#### Defined in

[packages/types/src/signer.ts:24](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L24)

___

### persistDisposableKeypair

• **persistDisposableKeypair**: (`address`: `string`) => `Promise`\<`void`\>

#### Type declaration

▸ (`address`): `Promise`\<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

##### Returns

`Promise`\<`void`\>

#### Defined in

[packages/types/src/signer.ts:25](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L25)

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

[packages/types/src/signer.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L14)

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

[packages/types/src/signer.ts:19](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L19)

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

[packages/types/src/signer.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L23)

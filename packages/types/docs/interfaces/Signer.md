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

[signer.ts:10](https://github.com/anoma/namada-interface/blob/fed376fb8f8e78431a4124d1835f659952e931ac/packages/types/src/signer.ts#L10)

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

[signer.ts:11](https://github.com/anoma/namada-interface/blob/fed376fb8f8e78431a4124d1835f659952e931ac/packages/types/src/signer.ts#L11)

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

[signer.ts:12](https://github.com/anoma/namada-interface/blob/fed376fb8f8e78431a4124d1835f659952e931ac/packages/types/src/signer.ts#L12)

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

[signer.ts:17](https://github.com/anoma/namada-interface/blob/fed376fb8f8e78431a4124d1835f659952e931ac/packages/types/src/signer.ts#L17)

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

[signer.ts:21](https://github.com/anoma/namada-interface/blob/fed376fb8f8e78431a4124d1835f659952e931ac/packages/types/src/signer.ts#L21)

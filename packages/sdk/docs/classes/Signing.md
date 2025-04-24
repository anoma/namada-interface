[@namada/sdk](../README.md) / [Exports](../modules.md) / Signing

# Class: Signing

Non-Tx signing functions

## Table of contents

### Constructors

- [constructor](Signing.md#constructor)

### Properties

- [sdk](Signing.md#sdk)

### Methods

- [sign](Signing.md#sign)
- [signArbitrary](Signing.md#signarbitrary)
- [signMasp](Signing.md#signmasp)
- [verifyArbitrary](Signing.md#verifyarbitrary)

## Constructors

### constructor

• **new Signing**(`sdk`): [`Signing`](Signing.md)

Signing constructor

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sdk` | `Sdk` | Instance of Sdk struct from wasm lib |

#### Returns

[`Signing`](Signing.md)

#### Defined in

[sdk/src/signing.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L14)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/signing.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L14)

## Methods

### sign

▸ **sign**(`txProps`, `signingKey`, `chainId?`): `Promise`\<`Uint8Array`\>

Sign Namada transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | TxProps |
| `signingKey` | `string` \| `string`[] | private key(s) |
| `chainId?` | `string` | optional chain ID, will enforce validation if present |

#### Returns

`Promise`\<`Uint8Array`\>

signed tx bytes - Promise resolving to Uint8Array

#### Defined in

[sdk/src/signing.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L23)

___

### signArbitrary

▸ **signArbitrary**(`signingKey`, `data`): `Signature`

Sign arbitrary data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signingKey` | `string` | private key |
| `data` | `string` | data to sign |

#### Returns

`Signature`

hash and signature

#### Defined in

[sdk/src/signing.ts:62](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L62)

___

### signMasp

▸ **signMasp**(`txProps`, `xsks`): `Promise`\<`Uint8Array`\>

Sign masp spends

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `txProps` | `TxMsgValue` | TxProps |
| `xsks` | `string`[] | spending keys |

#### Returns

`Promise`\<`Uint8Array`\>

tx with masp spends signed - Promise resolving to Uint8Array

#### Defined in

[sdk/src/signing.ts:48](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L48)

___

### verifyArbitrary

▸ **verifyArbitrary**(`publicKey`, `hash`, `signature`): `void`

Verify arbitrary signature. Will throw an error if the signature is invalid

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `publicKey` | `string` | public key to verify with |
| `hash` | `string` | signed hash |
| `signature` | `string` | Hex-encoded signature |

#### Returns

`void`

void

#### Defined in

[sdk/src/signing.ts:73](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/signing.ts#L73)

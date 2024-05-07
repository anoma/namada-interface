[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / Signing

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

[sdk/src/signing.ts:13](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/signing.ts#L13)

## Properties

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/signing.ts:13](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/signing.ts#L13)

## Methods

### sign

▸ **sign**(`signingKey`, `builtTx`): `unknown`

Sign Namada transaction

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signingKey` | `string` | private key |
| `builtTx` | `BuiltTx` | Tx and signing data to sign |

#### Returns

`unknown`

signed tx bytes - TODO: Fix this type!

#### Defined in

[sdk/src/signing.ts:21](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/signing.ts#L21)

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

[sdk/src/signing.ts:31](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/signing.ts#L31)

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

[sdk/src/signing.ts:42](https://github.com/anoma/namada-interface/blob/180f70bc/packages/sdk/src/signing.ts#L42)

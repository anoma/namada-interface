[@namada/sdk](../README.md) / [Exports](../modules.md) / Mnemonic

# Class: Mnemonic

Class for accessing mnemonic functionality from wasm

## Table of contents

### Constructors

- [constructor](Mnemonic.md#constructor)

### Properties

- [cryptoMemory](Mnemonic.md#cryptomemory)

### Methods

- [generate](Mnemonic.md#generate)
- [toSeed](Mnemonic.md#toseed)
- [validateMnemonic](Mnemonic.md#validatemnemonic)

## Constructors

### constructor

• **new Mnemonic**(`cryptoMemory`): [`Mnemonic`](Mnemonic.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cryptoMemory` | `Memory` | Memory accessor for crypto lib |

#### Returns

[`Mnemonic`](Mnemonic.md)

#### Defined in

[sdk/src/mnemonic.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/mnemonic.ts#L20)

## Properties

### cryptoMemory

• `Protected` `Readonly` **cryptoMemory**: `Memory`

Memory accessor for crypto lib

#### Defined in

[sdk/src/mnemonic.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/mnemonic.ts#L20)

## Methods

### generate

▸ **generate**(`size?`): `string`[]

Generate a new 12 or 24 word mnemonic

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `size?` | [`PhraseSize`](../enums/PhraseSize.md) | `PhraseSize.N12` | Mnemonic length |

#### Returns

`string`[]

An array of words

#### Defined in

[sdk/src/mnemonic.ts:27](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/mnemonic.ts#L27)

___

### toSeed

▸ **toSeed**(`phrase`, `passphrase?`): `Uint8Array`

Convert mnemonic to seed bytes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `phrase` | `string` | Mnemonic phrase |
| `passphrase?` | `string` | Bip39 passphrase |

#### Returns

`Uint8Array`

Seed bytes

#### Defined in

[sdk/src/mnemonic.ts:45](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/mnemonic.ts#L45)

___

### validateMnemonic

▸ **validateMnemonic**(`phrase`): `Object`

Validate a mnemonic string, raise an exception providing reason
for failure if invalid, otherwise return nothing

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `phrase` | `string` | Mnemonic phrase |

#### Returns

`Object`

Object with validation result and error message if invalid

| Name | Type |
| :------ | :------ |
| `error?` | `string` |
| `isValid` | `boolean` |

#### Defined in

[sdk/src/mnemonic.ts:63](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/mnemonic.ts#L63)

[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Mnemonic

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

[sdk/src/mnemonic.ts:18](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/mnemonic.ts#L18)

## Properties

### cryptoMemory

• `Protected` `Readonly` **cryptoMemory**: `Memory`

Memory accessor for crypto lib

#### Defined in

[sdk/src/mnemonic.ts:18](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/mnemonic.ts#L18)

## Methods

### generate

▸ **generate**(`size?`): `Promise`\<`string`[]\>

Generate a new 12 or 24 word mnemonic

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `size?` | [`PhraseSize`](../enums/PhraseSize.md) | `PhraseSize.N12` | Mnemonic length |

#### Returns

`Promise`\<`string`[]\>

Promise that resolves to array of words

**`Async`**

#### Defined in

[sdk/src/mnemonic.ts:26](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/mnemonic.ts#L26)

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

[sdk/src/mnemonic.ts:44](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/mnemonic.ts#L44)

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

[sdk/src/mnemonic.ts:62](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/mnemonic.ts#L62)

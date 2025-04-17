[@namada/sdk](../README.md) / [Exports](../modules.md) / Crypto

# Class: Crypto

Class Crypto handles AES encryption tasks

## Table of contents

### Constructors

- [constructor](Crypto.md#constructor)

### Properties

- [cryptoMemory](Crypto.md#cryptomemory)

### Methods

- [decrypt](Crypto.md#decrypt)
- [encrypt](Crypto.md#encrypt)
- [encryptWithAES](Crypto.md#encryptwithaes)
- [makeCryptoRecord](Crypto.md#makecryptorecord)
- [makeEncryptionParams](Crypto.md#makeencryptionparams)

## Constructors

### constructor

• **new Crypto**(`cryptoMemory`): [`Crypto`](Crypto.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cryptoMemory` | `Memory` | WebAssembly Memory for crypto |

#### Returns

[`Crypto`](Crypto.md)

#### Defined in

[sdk/src/crypto/crypto.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L20)

## Properties

### cryptoMemory

• `Protected` `Readonly` **cryptoMemory**: `Memory`

WebAssembly Memory for crypto

#### Defined in

[sdk/src/crypto/crypto.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L20)

## Methods

### decrypt

▸ **decrypt**(`cryptoRecord`, `password`): `string`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cryptoRecord` | [`CryptoRecord`](../modules.md#cryptorecord) | CryptoRecord value |
| `password` | `string` | password |

#### Returns

`string`

decrypted text

#### Defined in

[sdk/src/crypto/crypto.ts:115](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L115)

___

### encrypt

▸ **encrypt**(`plainText`, `password`): [`CryptoRecord`](../modules.md#cryptorecord)

Encrypt string using AES and Argon2

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `plainText` | `string` | data to be encrypted |
| `password` | `string` | password to use for encryption |

#### Returns

[`CryptoRecord`](../modules.md#cryptorecord)

crypto record

#### Defined in

[sdk/src/crypto/crypto.ts:61](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L61)

___

### encryptWithAES

▸ **encryptWithAES**(`key`, `iv`, `plainText`): `Uint8Array`

Encrypt plain-text with provide Key & IV

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `VecU8Pointer` | AES key |
| `iv` | `Uint8Array` | IV for AES |
| `plainText` | `string` | string to be encrypted |

#### Returns

`Uint8Array`

array of encrypted bytes

#### Defined in

[sdk/src/crypto/crypto.ts:98](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L98)

___

### makeCryptoRecord

▸ **makeCryptoRecord**(`cipherText`, `params`, `iv`, `salt`): [`CryptoRecord`](../modules.md#cryptorecord)

Provide object for storing encrypted data

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cipherText` | `Uint8Array` | encrypted bytes |
| `params` | `Argon2Params` | Argon2 parameters |
| `iv` | `Uint8Array` | array of IV bytes |
| `salt` | `string` | salt string |

#### Returns

[`CryptoRecord`](../modules.md#cryptorecord)

crypto record used for storage

#### Defined in

[sdk/src/crypto/crypto.ts:30](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L30)

___

### makeEncryptionParams

▸ **makeEncryptionParams**(`password`): [`EncryptionParams`](../modules.md#encryptionparams)

Construct encryption parameters such as password hash,
initialization vector, and salt from provided password

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `password` | `string` | required for generating password hash |

#### Returns

[`EncryptionParams`](../modules.md#encryptionparams)

encryption parameters

#### Defined in

[sdk/src/crypto/crypto.ts:73](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/crypto.ts#L73)

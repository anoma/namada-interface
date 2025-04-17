[@namada/sdk](../README.md) / [Exports](../modules.md) / Keys

# Class: Keys

Namespace for key related functions

## Table of contents

### Constructors

- [constructor](Keys.md#constructor)

### Properties

- [cryptoMemory](Keys.md#cryptomemory)

### Methods

- [deriveFromMnemonic](Keys.md#derivefrommnemonic)
- [deriveFromSeed](Keys.md#derivefromseed)
- [deriveFromShieldedWallet](Keys.md#derivefromshieldedwallet)
- [deriveShieldedFromPrivateKey](Keys.md#deriveshieldedfromprivatekey)
- [deriveShieldedFromSeed](Keys.md#deriveshieldedfromseed)
- [fromPrivateKey](Keys.md#fromprivatekey)
- [genDisposableKeypair](Keys.md#gendisposablekeypair)
- [genPaymentAddress](Keys.md#genpaymentaddress)
- [getAddress](Keys.md#getaddress)
- [shieldedKeysFromSpendingKey](Keys.md#shieldedkeysfromspendingkey)

## Constructors

### constructor

• **new Keys**(`cryptoMemory`): [`Keys`](Keys.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cryptoMemory` | `Memory` | Memory accessor for crypto lib |

#### Returns

[`Keys`](Keys.md)

#### Defined in

[sdk/src/keys/keys.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L35)

## Properties

### cryptoMemory

• `Protected` `Readonly` **cryptoMemory**: `Memory`

Memory accessor for crypto lib

#### Defined in

[sdk/src/keys/keys.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L35)

## Methods

### deriveFromMnemonic

▸ **deriveFromMnemonic**(`phrase`, `path?`, `passphrase?`): [`TransparentKeys`](../modules.md#transparentkeys)

Derive transparent keys and address from a mnemonic and path

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `phrase` | `string` | `undefined` | Mnemonic phrase |
| `path?` | `Bip44Path` | `DEFAULT_BIP44_PATH` | Bip44 path object |
| `passphrase?` | `string` | `undefined` | Bip39 passphrase |

#### Returns

[`TransparentKeys`](../modules.md#transparentkeys)

Keys and address

#### Defined in

[sdk/src/keys/keys.ts:72](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L72)

___

### deriveFromSeed

▸ **deriveFromSeed**(`seed`, `path?`): [`TransparentKeys`](../modules.md#transparentkeys)

Derive transparent keys and address from a seed and path

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `seed` | `Uint8Array` | `undefined` | Seed |
| `path?` | `Bip44Path` | `DEFAULT_BIP44_PATH` | Bip44 path object |

#### Returns

[`TransparentKeys`](../modules.md#transparentkeys)

Keys and address

#### Defined in

[sdk/src/keys/keys.ts:110](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L110)

___

### deriveFromShieldedWallet

▸ **deriveFromShieldedWallet**(`shieldedHdWallet`, `path`, `diversifier?`): [`ShieldedKeys`](../modules.md#shieldedkeys)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `shieldedHdWallet` | `ShieldedHDWallet` | Shielded HD Wallet instance |
| `path` | `Zip32Path` | Zip32 path object |
| `diversifier?` | `Uint8Array` | Diversifier bytes |

#### Returns

[`ShieldedKeys`](../modules.md#shieldedkeys)

Object representing MASP related keys

#### Defined in

[sdk/src/keys/keys.ts:181](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L181)

___

### deriveShieldedFromPrivateKey

▸ **deriveShieldedFromPrivateKey**(`privateKeyBytes`, `path?`, `diversifier?`): [`ShieldedKeys`](../modules.md#shieldedkeys)

Derive shielded keys and address from private key bytes

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `privateKeyBytes` | `Uint8Array` | `undefined` | secret |
| `path` | `Zip32Path` | `DEFAULT_ZIP32_PATH` | Zip32 path object |
| `diversifier?` | `Uint8Array` | `undefined` | Diversifier bytes |

#### Returns

[`ShieldedKeys`](../modules.md#shieldedkeys)

Shielded keys and address

#### Defined in

[sdk/src/keys/keys.ts:165](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L165)

___

### deriveShieldedFromSeed

▸ **deriveShieldedFromSeed**(`seed`, `zip32Path?`, `diversifier?`): [`ShieldedKeys`](../modules.md#shieldedkeys)

Derive shielded keys and address from a seed and path

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `seed` | `Uint8Array` | `undefined` | Seed |
| `zip32Path?` | `Zip32Path` | `DEFAULT_ZIP32_PATH` | Zip32 path object to derive the shielded keys |
| `diversifier?` | `Uint8Array` | `undefined` | Diversifier bytes |

#### Returns

[`ShieldedKeys`](../modules.md#shieldedkeys)

Shielded keys and address

#### Defined in

[sdk/src/keys/keys.ts:141](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L141)

___

### fromPrivateKey

▸ **fromPrivateKey**(`privateKey`): [`TransparentKeys`](../modules.md#transparentkeys)

Get transparent keys and address from private key

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `privateKey` | `string` | Private key |

#### Returns

[`TransparentKeys`](../modules.md#transparentkeys)

Keys and address

#### Defined in

[sdk/src/keys/keys.ts:58](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L58)

___

### genDisposableKeypair

▸ **genDisposableKeypair**(): [`TransparentKeys`](../modules.md#transparentkeys)

Generate a disposable transparent keypair

#### Returns

[`TransparentKeys`](../modules.md#transparentkeys)

Keys and address

#### Defined in

[sdk/src/keys/keys.ts:262](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L262)

___

### genPaymentAddress

▸ **genPaymentAddress**(`xfvk`, `index?`): [`GeneratedPaymentAddress`](../modules.md#generatedpaymentaddress)

Generate a payment address from viewing key and diversifier index

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `xfvk` | `string` | `undefined` | viewing key |
| `index?` | `number` | `0` | diversifier index |

#### Returns

[`GeneratedPaymentAddress`](../modules.md#generatedpaymentaddress)

GeneratedPaymentAddress

#### Defined in

[sdk/src/keys/keys.ts:227](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L227)

___

### getAddress

▸ **getAddress**(`privateKey`): [`Address`](../modules.md#address)

Get address and public key from private key

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `privateKey` | `string` | Private key |

#### Returns

[`Address`](../modules.md#address)

Address and public key

#### Defined in

[sdk/src/keys/keys.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L42)

___

### shieldedKeysFromSpendingKey

▸ **shieldedKeysFromSpendingKey**(`spendingKey`): [`ShieldedKeys`](../modules.md#shieldedkeys)

Given a bech32m-encoded extended spending key, return viewing and proof-gen keys

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `spendingKey` | `string` | string |

#### Returns

[`ShieldedKeys`](../modules.md#shieldedkeys)

ShieldedKeys

#### Defined in

[sdk/src/keys/keys.ts:240](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L240)

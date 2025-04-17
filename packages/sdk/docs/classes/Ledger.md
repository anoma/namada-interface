[@namada/sdk](../README.md) / [Exports](../modules.md) / Ledger

# Class: Ledger

Functionality for interacting with NamadaApp for Ledger Hardware Wallets

## Table of contents

### Constructors

- [constructor](Ledger.md#constructor)

### Properties

- [namadaApp](Ledger.md#namadaapp)

### Methods

- [closeTransport](Ledger.md#closetransport)
- [getAddressAndPublicKey](Ledger.md#getaddressandpublickey)
- [getBparams](Ledger.md#getbparams)
- [getProofGenerationKey](Ledger.md#getproofgenerationkey)
- [getViewingKey](Ledger.md#getviewingkey)
- [isZip32Supported](Ledger.md#iszip32supported)
- [queryErrors](Ledger.md#queryerrors)
- [showAddressAndPublicKey](Ledger.md#showaddressandpublickey)
- [sign](Ledger.md#sign)
- [status](Ledger.md#status)
- [validateZip32Support](Ledger.md#validatezip32support)
- [init](Ledger.md#init)

## Constructors

### constructor

• **new Ledger**(`namadaApp`): [`Ledger`](Ledger.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `namadaApp` | `NamadaApp` | Inititalized NamadaApp class from Zondax package |

#### Returns

[`Ledger`](Ledger.md)

#### Defined in

[sdk/src/ledger.ts:96](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L96)

## Properties

### namadaApp

• `Readonly` **namadaApp**: `NamadaApp`

Inititalized NamadaApp class from Zondax package

#### Defined in

[sdk/src/ledger.ts:96](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L96)

## Methods

### closeTransport

▸ **closeTransport**(): `Promise`\<`void`\>

Close the initialized transport, which may be needed if Ledger needs to be reinitialized due to error state
Throw exception if app is not initialized.

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/ledger.ts:339](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L339)

___

### getAddressAndPublicKey

▸ **getAddressAndPublicKey**(`path?`): `Promise`\<[`LedgerAddressAndPublicKey`](../modules.md#ledgeraddressandpublickey)\>

Get address and public key associated with optional path, otherwise, use default path
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for deriving key |

#### Returns

`Promise`\<[`LedgerAddressAndPublicKey`](../modules.md#ledgeraddressandpublickey)\>

Address and public key

**`Async`**

#### Defined in

[sdk/src/ledger.ts:142](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L142)

___

### getBparams

▸ **getBparams**(): `Promise`\<`Bparams`[]\>

Get Bparams for masp transactions

#### Returns

`Promise`\<`Bparams`[]\>

bparams

**`Async`**

#### Defined in

[sdk/src/ledger.ts:185](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L185)

___

### getProofGenerationKey

▸ **getProofGenerationKey**(`path?`, `promptUser?`): `Promise`\<[`LedgerProofGenerationKey`](../modules.md#ledgerproofgenerationkey)\>

Prompt user to get proof generation key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized, zip32 is not supported, or key is not returned.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_ZIP32_PATH` | Zip32 path for deriving key |
| `promptUser?` | `boolean` | `true` | boolean to determine whether to display on Ledger device and require approval |

#### Returns

`Promise`\<[`LedgerProofGenerationKey`](../modules.md#ledgerproofgenerationkey)\>

ShieldedKeys

**`Async`**

#### Defined in

[sdk/src/ledger.ts:272](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L272)

___

### getViewingKey

▸ **getViewingKey**(`path?`, `promptUser?`): `Promise`\<[`LedgerViewingKey`](../modules.md#ledgerviewingkey)\>

Prompt user to get viewing key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized, zip32 is not supported, or key is not returned.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_ZIP32_PATH` | Zip32 path for deriving key |
| `promptUser?` | `boolean` | `true` | boolean to determine whether to display on Ledger device and require approval |

#### Returns

`Promise`\<[`LedgerViewingKey`](../modules.md#ledgerviewingkey)\>

ShieldedKeys

**`Async`**

#### Defined in

[sdk/src/ledger.ts:239](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L239)

___

### isZip32Supported

▸ **isZip32Supported**(): `Promise`\<`boolean`\>

Check if Zip32 is supported by the installed app's version.
Throws error if app is not initialized

#### Returns

`Promise`\<`boolean`\>

boolean

**`Async`**

#### Defined in

[sdk/src/ledger.ts:349](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L349)

___

### queryErrors

▸ **queryErrors**(): `Promise`\<`string`\>

Query status to determine if device has thrown an error.
Throw exception if app is not initialized.

#### Returns

`Promise`\<`string`\>

Error message if error is found

**`Async`**

#### Defined in

[sdk/src/ledger.ts:322](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L322)

___

### showAddressAndPublicKey

▸ **showAddressAndPublicKey**(`path?`): `Promise`\<[`LedgerAddressAndPublicKey`](../modules.md#ledgeraddressandpublickey)\>

Prompt user to get address and public key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for deriving key |

#### Returns

`Promise`\<[`LedgerAddressAndPublicKey`](../modules.md#ledgeraddressandpublickey)\>

Address and public key

**`Async`**

#### Defined in

[sdk/src/ledger.ts:162](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L162)

___

### sign

▸ **sign**(`tx`, `path?`): `Promise`\<`ResponseSign`\>

Sign tx bytes with the key associated with the provided (or default) path.
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `tx` | `Uint8Array` | `undefined` | tx data blob to sign |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for signing account |

#### Returns

`Promise`\<`ResponseSign`\>

Response signature

**`Async`**

#### Defined in

[sdk/src/ledger.ts:307](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L307)

___

### status

▸ **status**(): `Promise`\<[`LedgerStatus`](../modules.md#ledgerstatus)\>

Return status and version info of initialized NamadaApp.
Throw exception if app is not initialized.

#### Returns

`Promise`\<[`LedgerStatus`](../modules.md#ledgerstatus)\>

Version and info of NamadaApp

**`Async`**

#### Defined in

[sdk/src/ledger.ts:122](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L122)

___

### validateZip32Support

▸ **validateZip32Support**(): `Promise`\<`void`\>

Validate the version against the minimum required version and
device type for Zip32 functionality.
Throw error if it is unsupported or app is not initialized.

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/ledger.ts:367](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L367)

___

### init

▸ **init**(`transport?`): `Promise`\<[`Ledger`](Ledger.md)\>

Initialize and return Ledger class instance with initialized Transport

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transport?` | `default` | Ledger transport |

#### Returns

`Promise`\<[`Ledger`](Ledger.md)\>

Ledger class instance

**`Async`**

#### Defined in

[sdk/src/ledger.ts:104](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L104)

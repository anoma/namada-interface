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
- [validateVersionForZip32](Ledger.md#validateversionforzip32)
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

[sdk/src/ledger.ts:93](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L93)

## Properties

### namadaApp

• `Readonly` **namadaApp**: `NamadaApp`

Inititalized NamadaApp class from Zondax package

#### Defined in

[sdk/src/ledger.ts:93](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L93)

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

[sdk/src/ledger.ts:333](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L333)

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

[sdk/src/ledger.ts:136](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L136)

___

### getBparams

▸ **getBparams**(): `Promise`\<`Bparams`[]\>

Get Bparams for masp transactions

#### Returns

`Promise`\<`Bparams`[]\>

bparams

**`Async`**

#### Defined in

[sdk/src/ledger.ts:179](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L179)

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

[sdk/src/ledger.ts:266](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L266)

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

[sdk/src/ledger.ts:233](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L233)

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

[sdk/src/ledger.ts:343](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L343)

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

[sdk/src/ledger.ts:316](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L316)

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

[sdk/src/ledger.ts:156](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L156)

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

[sdk/src/ledger.ts:301](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L301)

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

[sdk/src/ledger.ts:119](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L119)

___

### validateVersionForZip32

▸ **validateVersionForZip32**(): `Promise`\<`void`\>

Validate the version against the minimum required version for Zip32 functionality.
Throw error if it is unsupported or app is not initialized.

#### Returns

`Promise`\<`void`\>

void

**`Async`**

#### Defined in

[sdk/src/ledger.ts:356](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L356)

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

[sdk/src/ledger.ts:101](https://github.com/anoma/namada-interface/blob/7edc5dea72f906ae6699549c1d9c128a2fd22eac/packages/sdk/src/ledger.ts#L101)

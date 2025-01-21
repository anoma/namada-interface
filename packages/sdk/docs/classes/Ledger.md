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
- [getShieldedKeys](Ledger.md#getshieldedkeys)
- [queryErrors](Ledger.md#queryerrors)
- [showAddressAndPublicKey](Ledger.md#showaddressandpublickey)
- [sign](Ledger.md#sign)
- [status](Ledger.md#status)
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

[sdk/src/ledger.ts:68](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L68)

## Properties

### namadaApp

• `Readonly` **namadaApp**: `NamadaApp`

Inititalized NamadaApp class from Zondax package

#### Defined in

[sdk/src/ledger.ts:68](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L68)

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

[sdk/src/ledger.ts:228](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L228)

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

[sdk/src/ledger.ts:111](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L111)

___

### getShieldedKeys

▸ **getShieldedKeys**(`path?`, `promptUser?`): `Promise`\<[`LedgerShieldedKeys`](../modules.md#ledgershieldedkeys)\>

Prompt user to get viewing and proof gen key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for deriving key |
| `promptUser?` | `boolean` | `true` | boolean to determine whether to display on Ledger device and require approval |

#### Returns

`Promise`\<[`LedgerShieldedKeys`](../modules.md#ledgershieldedkeys)\>

ShieldedKeys

**`Async`**

#### Defined in

[sdk/src/ledger.ts:157](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L157)

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

[sdk/src/ledger.ts:211](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L211)

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

[sdk/src/ledger.ts:131](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L131)

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

[sdk/src/ledger.ts:196](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L196)

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

[sdk/src/ledger.ts:94](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L94)

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

[sdk/src/ledger.ts:76](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L76)

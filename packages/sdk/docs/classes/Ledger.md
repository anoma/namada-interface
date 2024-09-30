[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Ledger

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

[sdk/src/ledger.ts:53](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L53)

## Properties

### namadaApp

• `Readonly` **namadaApp**: `NamadaApp`

Inititalized NamadaApp class from Zondax package

#### Defined in

[sdk/src/ledger.ts:53](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L53)

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

[sdk/src/ledger.ts:174](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L174)

___

### getAddressAndPublicKey

▸ **getAddressAndPublicKey**(`path?`): `Promise`\<[`AddressAndPublicKey`](../modules.md#addressandpublickey)\>

Get address and public key associated with optional path, otherwise, use default path
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for deriving key |

#### Returns

`Promise`\<[`AddressAndPublicKey`](../modules.md#addressandpublickey)\>

Address and public key

**`Async`**

#### Defined in

[sdk/src/ledger.ts:96](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L96)

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

[sdk/src/ledger.ts:157](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L157)

___

### showAddressAndPublicKey

▸ **showAddressAndPublicKey**(`path?`): `Promise`\<[`AddressAndPublicKey`](../modules.md#addressandpublickey)\>

Prompt user to get address and public key associated with optional path, otherwise, use default path.
Throw exception if app is not initialized.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `path?` | `string` | `DEFAULT_LEDGER_BIP44_PATH` | Bip44 path for deriving key |

#### Returns

`Promise`\<[`AddressAndPublicKey`](../modules.md#addressandpublickey)\>

Address and public key

**`Async`**

#### Defined in

[sdk/src/ledger.ts:116](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L116)

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

[sdk/src/ledger.ts:142](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L142)

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

[sdk/src/ledger.ts:79](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L79)

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

[sdk/src/ledger.ts:61](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/ledger.ts#L61)

[@namada/sdk](../README.md) / [Exports](../modules.md) / Sdk

# Class: Sdk

API for interacting with Namada SDK

## Table of contents

### Constructors

- [constructor](Sdk.md#constructor)

### Properties

- [cryptoMemory](Sdk.md#cryptomemory)
- [nativeToken](Sdk.md#nativetoken)
- [query](Sdk.md#query)
- [sdk](Sdk.md#sdk)
- [url](Sdk.md#url)

### Accessors

- [keys](Sdk.md#keys)
- [masp](Sdk.md#masp)
- [mnemonic](Sdk.md#mnemonic)
- [rpc](Sdk.md#rpc)
- [signing](Sdk.md#signing)
- [tx](Sdk.md#tx)

### Methods

- [getKeys](Sdk.md#getkeys)
- [getMasp](Sdk.md#getmasp)
- [getMnemonic](Sdk.md#getmnemonic)
- [getRpc](Sdk.md#getrpc)
- [getSigning](Sdk.md#getsigning)
- [getTx](Sdk.md#gettx)
- [initLedger](Sdk.md#initledger)

## Constructors

### constructor

• **new Sdk**(`sdk`, `query`, `cryptoMemory`, `url`, `nativeToken`): [`Sdk`](Sdk.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sdk` | `Sdk` | Instance of Sdk struct from wasm lib |
| `query` | `Query` | Instance of Query struct from wasm lib |
| `cryptoMemory` | `Memory` | Memory accessor for crypto lib |
| `url` | `string` | RPC url |
| `nativeToken` | `string` | Address of chain's native token |

#### Returns

[`Sdk`](Sdk.md)

#### Defined in

[sdk/src/sdk.ts:22](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L22)

## Properties

### cryptoMemory

• `Readonly` **cryptoMemory**: `Memory`

Memory accessor for crypto lib

#### Defined in

[sdk/src/sdk.ts:25](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L25)

___

### nativeToken

• `Readonly` **nativeToken**: `string`

Address of chain's native token

#### Defined in

[sdk/src/sdk.ts:27](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L27)

___

### query

• `Protected` `Readonly` **query**: `Query`

Instance of Query struct from wasm lib

#### Defined in

[sdk/src/sdk.ts:24](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L24)

___

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/sdk.ts:23](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L23)

___

### url

• `Readonly` **url**: `string`

RPC url

#### Defined in

[sdk/src/sdk.ts:26](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L26)

## Accessors

### keys

• `get` **keys**(): `Keys`

Define keys getter to use with destructuring assignment

#### Returns

`Keys`

key-related functionality

#### Defined in

[sdk/src/sdk.ts:115](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L115)

___

### masp

• `get` **masp**(): `Masp`

Define signing getter to use with destructuring assignment

#### Returns

`Masp`

Masp utilities for handling params

#### Defined in

[sdk/src/sdk.ts:131](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L131)

___

### mnemonic

• `get` **mnemonic**(): `Mnemonic`

Define mnemonic getter to use with destructuring assignment

#### Returns

`Mnemonic`

mnemonic-related functionality

#### Defined in

[sdk/src/sdk.ts:107](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L107)

___

### rpc

• `get` **rpc**(): [`Rpc`](Rpc.md)

Define rpc getter to use with destructuring assignment

#### Returns

[`Rpc`](Rpc.md)

rpc client

#### Defined in

[sdk/src/sdk.ts:91](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L91)

___

### signing

• `get` **signing**(): `Signing`

Define signing getter to use with destructuring assignment

#### Returns

`Signing`

Non-Tx signing functionality

#### Defined in

[sdk/src/sdk.ts:123](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L123)

___

### tx

• `get` **tx**(): `Tx`

Define tx getter to use with destructuring assignment

#### Returns

`Tx`

tx-related functionality

#### Defined in

[sdk/src/sdk.ts:99](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L99)

## Methods

### getKeys

▸ **getKeys**(): `Keys`

Return initialized Keys class

#### Returns

`Keys`

key-related functionality

#### Defined in

[sdk/src/sdk.ts:57](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L57)

___

### getMasp

▸ **getMasp**(): `Masp`

Return initialized Masp class

#### Returns

`Masp`

Masp utilities for handling params

#### Defined in

[sdk/src/sdk.ts:73](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L73)

___

### getMnemonic

▸ **getMnemonic**(): `Mnemonic`

Return initialized Mnemonic class

#### Returns

`Mnemonic`

mnemonic-related functionality

#### Defined in

[sdk/src/sdk.ts:49](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L49)

___

### getRpc

▸ **getRpc**(): [`Rpc`](Rpc.md)

Return initialized Rpc class

#### Returns

[`Rpc`](Rpc.md)

Namada RPC client

#### Defined in

[sdk/src/sdk.ts:33](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L33)

___

### getSigning

▸ **getSigning**(): `Signing`

Return initialized Signing class

#### Returns

`Signing`

Non-Tx signing functionality

#### Defined in

[sdk/src/sdk.ts:65](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L65)

___

### getTx

▸ **getTx**(): `Tx`

Return initialized Tx class

#### Returns

`Tx`

Tx-related functionality

#### Defined in

[sdk/src/sdk.ts:41](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L41)

___

### initLedger

▸ **initLedger**(`transport?`): `Promise`\<[`Ledger`](Ledger.md)\>

Intialize Ledger class for use with NamadaApp

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `transport?` | `default` | Will default to USB transport if not specified |

#### Returns

`Promise`\<[`Ledger`](Ledger.md)\>

Class for interacting with NamadaApp for Ledger Hardware Wallets

**`Async`**

#### Defined in

[sdk/src/sdk.ts:83](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/sdk.ts#L83)

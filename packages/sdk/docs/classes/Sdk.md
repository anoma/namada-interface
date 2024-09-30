[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Sdk

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

- [crypto](Sdk.md#crypto)
- [keys](Sdk.md#keys)
- [masp](Sdk.md#masp)
- [mnemonic](Sdk.md#mnemonic)
- [rpc](Sdk.md#rpc)
- [signing](Sdk.md#signing)
- [tx](Sdk.md#tx)

### Methods

- [getCrypto](Sdk.md#getcrypto)
- [getKeys](Sdk.md#getkeys)
- [getMasp](Sdk.md#getmasp)
- [getMnemonic](Sdk.md#getmnemonic)
- [getRpc](Sdk.md#getrpc)
- [getSigning](Sdk.md#getsigning)
- [getTx](Sdk.md#gettx)
- [initLedger](Sdk.md#initledger)
- [updateNetwork](Sdk.md#updatenetwork)

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

[sdk/src/sdk.ts:23](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L23)

## Properties

### cryptoMemory

• `Readonly` **cryptoMemory**: `Memory`

Memory accessor for crypto lib

#### Defined in

[sdk/src/sdk.ts:26](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L26)

___

### nativeToken

• `Readonly` **nativeToken**: `string`

Address of chain's native token

#### Defined in

[sdk/src/sdk.ts:28](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L28)

___

### query

• `Protected` **query**: `Query`

Instance of Query struct from wasm lib

#### Defined in

[sdk/src/sdk.ts:25](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L25)

___

### sdk

• `Protected` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/sdk.ts:24](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L24)

___

### url

• `Readonly` **url**: `string`

RPC url

#### Defined in

[sdk/src/sdk.ts:27](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L27)

## Accessors

### crypto

• `get` **crypto**(): [`Crypto`](Crypto.md)

Define crypto getter to use with destructuring assignment

#### Returns

[`Crypto`](Crypto.md)

Utilities for encrypting and decrypting data

#### Defined in

[sdk/src/sdk.ts:166](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L166)

___

### keys

• `get` **keys**(): `Keys`

Define keys getter to use with destructuring assignment

#### Returns

`Keys`

key-related functionality

#### Defined in

[sdk/src/sdk.ts:142](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L142)

___

### masp

• `get` **masp**(): [`Masp`](Masp.md)

Define signing getter to use with destructuring assignment

#### Returns

[`Masp`](Masp.md)

Masp utilities for handling params

#### Defined in

[sdk/src/sdk.ts:158](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L158)

___

### mnemonic

• `get` **mnemonic**(): [`Mnemonic`](Mnemonic.md)

Define mnemonic getter to use with destructuring assignment

#### Returns

[`Mnemonic`](Mnemonic.md)

mnemonic-related functionality

#### Defined in

[sdk/src/sdk.ts:134](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L134)

___

### rpc

• `get` **rpc**(): [`Rpc`](Rpc.md)

Define rpc getter to use with destructuring assignment

#### Returns

[`Rpc`](Rpc.md)

rpc client

#### Defined in

[sdk/src/sdk.ts:118](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L118)

___

### signing

• `get` **signing**(): [`Signing`](Signing.md)

Define signing getter to use with destructuring assignment

#### Returns

[`Signing`](Signing.md)

Non-Tx signing functionality

#### Defined in

[sdk/src/sdk.ts:150](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L150)

___

### tx

• `get` **tx**(): [`Tx`](Tx.md)

Define tx getter to use with destructuring assignment

#### Returns

[`Tx`](Tx.md)

tx-related functionality

#### Defined in

[sdk/src/sdk.ts:126](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L126)

## Methods

### getCrypto

▸ **getCrypto**(): [`Crypto`](Crypto.md)

Return initialized Crypto class

#### Returns

[`Crypto`](Crypto.md)

Utilities for encrypting and decrypting data

#### Defined in

[sdk/src/sdk.ts:100](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L100)

___

### getKeys

▸ **getKeys**(): `Keys`

Return initialized Keys class

#### Returns

`Keys`

key-related functionality

#### Defined in

[sdk/src/sdk.ts:76](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L76)

___

### getMasp

▸ **getMasp**(): [`Masp`](Masp.md)

Return initialized Masp class

#### Returns

[`Masp`](Masp.md)

Masp utilities for handling params

#### Defined in

[sdk/src/sdk.ts:92](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L92)

___

### getMnemonic

▸ **getMnemonic**(): [`Mnemonic`](Mnemonic.md)

Return initialized Mnemonic class

#### Returns

[`Mnemonic`](Mnemonic.md)

mnemonic-related functionality

#### Defined in

[sdk/src/sdk.ts:68](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L68)

___

### getRpc

▸ **getRpc**(): [`Rpc`](Rpc.md)

Return initialized Rpc class

#### Returns

[`Rpc`](Rpc.md)

Namada RPC client

#### Defined in

[sdk/src/sdk.ts:52](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L52)

___

### getSigning

▸ **getSigning**(): [`Signing`](Signing.md)

Return initialized Signing class

#### Returns

[`Signing`](Signing.md)

Non-Tx signing functionality

#### Defined in

[sdk/src/sdk.ts:84](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L84)

___

### getTx

▸ **getTx**(): [`Tx`](Tx.md)

Return initialized Tx class

#### Returns

[`Tx`](Tx.md)

Tx-related functionality

#### Defined in

[sdk/src/sdk.ts:60](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L60)

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

[sdk/src/sdk.ts:110](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L110)

___

### updateNetwork

▸ **updateNetwork**(`url`, `nativeToken?`): [`Sdk`](Sdk.md)

Re-initialize wasm instances and return this instance

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `url` | `string` | RPC url |
| `nativeToken?` | `string` | Address of chain's native token |

#### Returns

[`Sdk`](Sdk.md)

this instance of Sdk

#### Defined in

[sdk/src/sdk.ts:37](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/sdk.ts#L37)

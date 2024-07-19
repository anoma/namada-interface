[@heliax/namada-sdk](../README.md) / [Exports](../modules.md) / Rpc

# Class: Rpc

API for executing RPC requests with Namada

## Table of contents

### Constructors

- [constructor](Rpc.md#constructor)

### Properties

- [query](Rpc.md#query)
- [sdk](Rpc.md#sdk)

### Methods

- [broadcastTx](Rpc.md#broadcasttx)
- [queryAllValidators](Rpc.md#queryallvalidators)
- [queryBalance](Rpc.md#querybalance)
- [queryDelegatorsVotes](Rpc.md#querydelegatorsvotes)
- [queryGasCosts](Rpc.md#querygascosts)
- [queryNativeToken](Rpc.md#querynativetoken)
- [queryPublicKey](Rpc.md#querypublickey)
- [querySignedBridgePool](Rpc.md#querysignedbridgepool)
- [queryStakingPositions](Rpc.md#querystakingpositions)
- [queryStakingTotals](Rpc.md#querystakingtotals)
- [queryTotalBonds](Rpc.md#querytotalbonds)
- [queryTotalDelegations](Rpc.md#querytotaldelegations)
- [queryWasmHashes](Rpc.md#querywasmhashes)
- [shieldedSync](Rpc.md#shieldedsync)

## Constructors

### constructor

• **new Rpc**(`sdk`, `query`): [`Rpc`](Rpc.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sdk` | `Sdk` | Instance of Sdk struct from wasm lib |
| `query` | `Query` | Instance of Query struct from wasm lib |

#### Returns

[`Rpc`](Rpc.md)

#### Defined in

[sdk/src/rpc/rpc.ts:30](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L30)

## Properties

### query

• `Protected` `Readonly` **query**: `Query`

Instance of Query struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:32](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L32)

___

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:31](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L31)

## Methods

### broadcastTx

▸ **broadcastTx**(`signedTx`): `Promise`\<`TxResponseMsgValue`\>

Broadcast a Tx to the ledger

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signedTx` | [`SignedTx`](SignedTx.md) | Transaction with signature |

#### Returns

`Promise`\<`TxResponseMsgValue`\>

TxResponseProps object

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:207](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L207)

___

### queryAllValidators

▸ **queryAllValidators**(): `Promise`\<`string`[]\>

Query all validator addresses

#### Returns

`Promise`\<`string`[]\>

Array of all validator addresses

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:72](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L72)

___

### queryBalance

▸ **queryBalance**(`owner`, `tokens`): `Promise`\<[`Balance`](../modules.md#balance)\>

Query balances from chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Owner address |
| `tokens` | `string`[] | Array of token addresses |

#### Returns

`Promise`\<[`Balance`](../modules.md#balance)\>

[[tokenAddress, amount]]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:42](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L42)

___

### queryDelegatorsVotes

▸ **queryDelegatorsVotes**(`proposalId`): `Promise`\<[`DelegatorsVotes`](../modules.md#delegatorsvotes)\>

Query delegators votes

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `proposalId` | `bigint` | ID of the proposal |

#### Returns

`Promise`\<[`DelegatorsVotes`](../modules.md#delegatorsvotes)\>

Promise resolving to delegators votes

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:96](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L96)

___

### queryGasCosts

▸ **queryGasCosts**(): `Promise`\<`GasCosts`\>

Query gas costs

#### Returns

`Promise`\<`GasCosts`\>

[[tokenAddress, gasCost]]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:188](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L188)

___

### queryNativeToken

▸ **queryNativeToken**(): `Promise`\<`string`\>

Query native token from chain

#### Returns

`Promise`\<`string`\>

Address of native token

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:51](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L51)

___

### queryPublicKey

▸ **queryPublicKey**(`address`): `Promise`\<`undefined` \| `string`\>

Query public key
Return string of public key if it has been revealed on chain, otherwise, return null

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | Address to query |

#### Returns

`Promise`\<`undefined` \| `string`\>

String of public key if found

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:62](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L62)

___

### querySignedBridgePool

▸ **querySignedBridgePool**(`owners`): `Promise`\<`TransferToEthereum`[]\>

Query pending transactions in the signed bridge pool

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owners` | `string`[] | Array of owner addresses |

#### Returns

`Promise`\<`TransferToEthereum`[]\>

Promise resolving to pending ethereum transfers

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:179](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L179)

___

### queryStakingPositions

▸ **queryStakingPositions**(`owners`): `Promise`\<[`StakingPositions`](../modules.md#stakingpositions)\>

Query bond and unbond details by owner addresses

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owners` | `string`[] | Array of owner addresses |

#### Returns

`Promise`\<[`StakingPositions`](../modules.md#stakingpositions)\>

Promise resolving to staking positions

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:133](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L133)

___

### queryStakingTotals

▸ **queryStakingTotals**(`owners`): `Promise`\<[`StakingTotals`](../modules.md#stakingtotals)[]\>

Query staking totals by owner addresses

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owners` | `string`[] | Array of owner addresses |

#### Returns

`Promise`\<[`StakingTotals`](../modules.md#stakingtotals)[]\>

Promise resolving to staking totals

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:106](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L106)

___

### queryTotalBonds

▸ **queryTotalBonds**(`owner`): `Promise`\<`number`\>

Query total bonds by owner address

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Owner address |

#### Returns

`Promise`\<`number`\>

Total bonds amount

#### Defined in

[sdk/src/rpc/rpc.ts:169](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L169)

___

### queryTotalDelegations

▸ **queryTotalDelegations**(`owners`, `epoch?`): `Promise`\<[`DelegationTotals`](../modules.md#delegationtotals)\>

Query total delegations

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owners` | `string`[] | Array of owner addresses |
| `epoch?` | `bigint` | delegations at epoch |

#### Returns

`Promise`\<[`DelegationTotals`](../modules.md#delegationtotals)\>

Promise resolving to total delegations

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:83](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L83)

___

### queryWasmHashes

▸ **queryWasmHashes**(): `Promise`\<`WasmHash`[]\>

Query code paths and their associated hash on chain

#### Returns

`Promise`\<`WasmHash`[]\>

WasmHash[]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:197](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L197)

___

### shieldedSync

▸ **shieldedSync**(`vks`): `Promise`\<`void`\>

Sync the shielded context

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `vks` | `string`[] | Array of viewing keys |

#### Returns

`Promise`\<`void`\>

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:219](https://github.com/anoma/namada-interface/blob/12a1c5c6/packages/sdk/src/rpc/rpc.ts#L219)

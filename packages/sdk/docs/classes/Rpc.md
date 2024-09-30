[@heliaxdev/namada-sdk](../README.md) / [Exports](../modules.md) / Rpc

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
- [queryChecksums](Rpc.md#querychecksums)
- [queryDelegatorsVotes](Rpc.md#querydelegatorsvotes)
- [queryGasCosts](Rpc.md#querygascosts)
- [queryNativeToken](Rpc.md#querynativetoken)
- [queryPublicKey](Rpc.md#querypublickey)
- [querySignedBridgePool](Rpc.md#querysignedbridgepool)
- [queryStakingPositions](Rpc.md#querystakingpositions)
- [queryStakingTotals](Rpc.md#querystakingtotals)
- [queryTotalBonds](Rpc.md#querytotalbonds)
- [queryTotalDelegations](Rpc.md#querytotaldelegations)
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

[sdk/src/rpc/rpc.ts:36](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L36)

## Properties

### query

• `Protected` `Readonly` **query**: `Query`

Instance of Query struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:38](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L38)

___

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:37](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L37)

## Methods

### broadcastTx

▸ **broadcastTx**(`signedTxBytes`, `args`): `Promise`\<`TxResponseMsgValue`\>

Broadcast a Tx to the ledger

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signedTxBytes` | `Uint8Array` | Transaction with signature |
| `args` | `WrapperTxMsgValue` | WrapperTxProps |

#### Returns

`Promise`\<`TxResponseMsgValue`\>

TxResponseProps object

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:223](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L223)

___

### queryAllValidators

▸ **queryAllValidators**(): `Promise`\<`string`[]\>

Query all validator addresses

#### Returns

`Promise`\<`string`[]\>

Array of all validator addresses

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:78](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L78)

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

[sdk/src/rpc/rpc.ts:48](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L48)

___

### queryChecksums

▸ **queryChecksums**(): `Promise`\<`Record`\<`string`, `string`\>\>

Query code paths and their associated hash on chain

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

Object

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:203](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L203)

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

[sdk/src/rpc/rpc.ts:102](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L102)

___

### queryGasCosts

▸ **queryGasCosts**(): `Promise`\<`GasCosts`\>

Query gas costs

#### Returns

`Promise`\<`GasCosts`\>

[[tokenAddress, gasCost]]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:194](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L194)

___

### queryNativeToken

▸ **queryNativeToken**(): `Promise`\<`string`\>

Query native token from chain

#### Returns

`Promise`\<`string`\>

Address of native token

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:57](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L57)

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

[sdk/src/rpc/rpc.ts:68](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L68)

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

[sdk/src/rpc/rpc.ts:185](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L185)

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

[sdk/src/rpc/rpc.ts:139](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L139)

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

[sdk/src/rpc/rpc.ts:112](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L112)

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

[sdk/src/rpc/rpc.ts:175](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L175)

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

[sdk/src/rpc/rpc.ts:89](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L89)

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

[sdk/src/rpc/rpc.ts:241](https://github.com/anoma/namada-interface/blob/94680966928a35de6fe585c6a3a29fe406ea8eea/packages/sdk/src/rpc/rpc.ts#L241)

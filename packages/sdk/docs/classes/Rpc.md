[@namada/sdk](../README.md) / [Exports](../modules.md) / Rpc

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
- [globalShieldedRewardForTokens](Rpc.md#globalshieldedrewardfortokens)
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
- [shieldedRewards](Rpc.md#shieldedrewards)
- [shieldedRewardsPerToken](Rpc.md#shieldedrewardspertoken)
- [shieldedSync](Rpc.md#shieldedsync)
- [simulateShieldedRewards](Rpc.md#simulateshieldedrewards)

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

[sdk/src/rpc/rpc.ts:37](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L37)

## Properties

### query

• `Protected` `Readonly` **query**: `Query`

Instance of Query struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:39](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L39)

___

### sdk

• `Protected` `Readonly` **sdk**: `Sdk`

Instance of Sdk struct from wasm lib

#### Defined in

[sdk/src/rpc/rpc.ts:38](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L38)

## Methods

### broadcastTx

▸ **broadcastTx**(`signedTxBytes`, `deadline?`): `Promise`\<`TxResponseMsgValue`\>

Broadcast a Tx to the ledger

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `signedTxBytes` | `Uint8Array` | Transaction with signature |
| `deadline?` | `bigint` | timeout deadline in seconds, defaults to 60 seconds |

#### Returns

`Promise`\<`TxResponseMsgValue`\>

TxResponseProps object

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:229](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L229)

___

### globalShieldedRewardForTokens

▸ **globalShieldedRewardForTokens**(): `Promise`\<`MaspTokenRewards`[]\>

Return global shielded rewards per token

#### Returns

`Promise`\<`MaspTokenRewards`[]\>

Array of MaspTokenRewards

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:272](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L272)

___

### queryAllValidators

▸ **queryAllValidators**(): `Promise`\<`string`[]\>

Query all validator addresses

#### Returns

`Promise`\<`string`[]\>

Array of all validator addresses

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:84](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L84)

___

### queryBalance

▸ **queryBalance**(`owner`, `tokens`, `chainId`): `Promise`\<[`Balance`](../modules.md#balance)\>

Query balances from chain

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Owner address |
| `tokens` | `string`[] | Array of token addresses |
| `chainId` | `string` | Chain id needed to load specific context |

#### Returns

`Promise`\<[`Balance`](../modules.md#balance)\>

[[tokenAddress, amount]]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:50](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L50)

___

### queryChecksums

▸ **queryChecksums**(): `Promise`\<`Record`\<`string`, `string`\>\>

Query code paths and their associated hash on chain

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

Object

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:209](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L209)

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

[sdk/src/rpc/rpc.ts:108](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L108)

___

### queryGasCosts

▸ **queryGasCosts**(): `Promise`\<`GasCosts`\>

Query gas costs

#### Returns

`Promise`\<`GasCosts`\>

[[tokenAddress, gasCost]]

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:200](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L200)

___

### queryNativeToken

▸ **queryNativeToken**(): `Promise`\<`string`\>

Query native token from chain

#### Returns

`Promise`\<`string`\>

Address of native token

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:63](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L63)

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

[sdk/src/rpc/rpc.ts:74](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L74)

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

[sdk/src/rpc/rpc.ts:191](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L191)

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

[sdk/src/rpc/rpc.ts:145](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L145)

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

[sdk/src/rpc/rpc.ts:118](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L118)

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

[sdk/src/rpc/rpc.ts:181](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L181)

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

[sdk/src/rpc/rpc.ts:95](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L95)

___

### shieldedRewards

▸ **shieldedRewards**(`owner`, `chainId`): `Promise`\<`string`\>

Return shielded rewards for specific owner for the next masp epoch

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Viewing key of an owner |
| `chainId` | `string` | Chain ID to load the context for |

#### Returns

`Promise`\<`string`\>

amount in base units

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:263](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L263)

___

### shieldedRewardsPerToken

▸ **shieldedRewardsPerToken**(`owner`, `token`, `chainId`): `Promise`\<`string`\>

Return shielded rewards for specific owner and token for the next masp epoch

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `owner` | `string` | Viewing key of an owner |
| `token` | `string` | Token address |
| `chainId` | `string` | Chain ID to load the context for |

#### Returns

`Promise`\<`string`\>

amount in base units

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:310](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L310)

___

### shieldedSync

▸ **shieldedSync**(`vks`, `chainId`): `Promise`\<`void`\>

Sync the shielded context

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `vks` | `DatedViewingKey`[] | Array of dated viewing keys |
| `chainId` | `string` | Chain ID to sync the shielded context for |

#### Returns

`Promise`\<`void`\>

**`Async`**

#### Defined in

[sdk/src/rpc/rpc.ts:248](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L248)

___

### simulateShieldedRewards

▸ **simulateShieldedRewards**(`chainId`, `token`, `amount`): `Promise`\<`string`\>

Simulate shielded rewards per token and amount in next epoch

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `chainId` | `string` | Chain ID to load the context for |
| `token` | `string` | Token address |
| `amount` | `string` | Denominated amount |

#### Returns

`Promise`\<`string`\>

amount in base units

#### Defined in

[sdk/src/rpc/rpc.ts:325](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/rpc.ts#L325)

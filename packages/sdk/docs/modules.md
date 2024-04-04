[@namada/sdk](README.md) / Exports

# @namada/sdk

## Table of contents

### Enumerations

- [PhraseSize](enums/PhraseSize.md)
- [TxType](enums/TxType.md)

### Classes

- [EncodedTx](classes/EncodedTx.md)
- [Ledger](classes/Ledger.md)
- [Rpc](classes/Rpc.md)
- [Sdk](classes/Sdk.md)
- [SignedTx](classes/SignedTx.md)

### Type Aliases

- [Address](modules.md#address)
- [AddressAndPublicKey](modules.md#addressandpublickey)
- [Balance](modules.md#balance)
- [Bonds](modules.md#bonds)
- [DelegationTotals](modules.md#delegationtotals)
- [DelegatorsVotes](modules.md#delegatorsvotes)
- [LedgerStatus](modules.md#ledgerstatus)
- [ShieldedKeys](modules.md#shieldedkeys)
- [StakingPositions](modules.md#stakingpositions)
- [StakingTotals](modules.md#stakingtotals)
- [SupportedTx](modules.md#supportedtx)
- [TransparentKeys](modules.md#transparentkeys)
- [Unbonds](modules.md#unbonds)

### Variables

- [DEFAULT\_LEDGER\_BIP44\_PATH](modules.md#default_ledger_bip44_path)
- [TxTypeLabel](modules.md#txtypelabel)

### Functions

- [initLedgerHIDTransport](modules.md#initledgerhidtransport)
- [initLedgerUSBTransport](modules.md#initledgerusbtransport)
- [publicKeyToBech32](modules.md#publickeytobech32)

## Type Aliases

### Address

Ƭ **Address**: `Object`

Address and public key type

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `publicKey` | `string` |

#### Defined in

[sdk/src/keys/types.ts:4](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/keys/types.ts#L4)

___

### AddressAndPublicKey

Ƭ **AddressAndPublicKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `publicKey` | `string` |

#### Defined in

[sdk/src/ledger.ts:17](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/ledger.ts#L17)

___

### Balance

Ƭ **Balance**: [`string`, `string`][]

Balance
[tokenAddress, amount][]

#### Defined in

[sdk/src/rpc/types.ts:69](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L69)

___

### Bonds

Ƭ **Bonds**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `string` |
| `owner` | `string` |
| `startEpoch` | `string` |
| `validator` | `string` |

#### Defined in

[sdk/src/rpc/types.ts:27](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L27)

___

### DelegationTotals

Ƭ **DelegationTotals**: `Record`\<`string`, `number`\>

DelegationTotals
Record<address, totalDelegations>

#### Defined in

[sdk/src/rpc/types.ts:51](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L51)

___

### DelegatorsVotes

Ƭ **DelegatorsVotes**: `Record`\<`string`, `boolean`\>

Delegator Votes
Record<address, boolean>

#### Defined in

[sdk/src/rpc/types.ts:57](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L57)

___

### LedgerStatus

Ƭ **LedgerStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `info` | `ResponseAppInfo` |
| `version` | `ResponseVersion` |

#### Defined in

[sdk/src/ledger.ts:18](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/ledger.ts#L18)

___

### ShieldedKeys

Ƭ **ShieldedKeys**: `Object`

Shielded keys and address

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `spendingKey` | `string` |
| `viewingKey` | `string` |

#### Defined in

[sdk/src/keys/types.ts:19](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/keys/types.ts#L19)

___

### StakingPositions

Ƭ **StakingPositions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bonds` | [`Bonds`](modules.md#bonds)[] |
| `unbonds` | [`Unbonds`](modules.md#unbonds)[] |

#### Defined in

[sdk/src/rpc/types.ts:42](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L42)

___

### StakingTotals

Ƭ **StakingTotals**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bonds` | `string` |
| `owner` | `string` |
| `unbonds` | `string` |
| `validator` | `string` |
| `withdrawable` | `string` |

#### Defined in

[sdk/src/rpc/types.ts:19](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L19)

___

### SupportedTx

Ƭ **SupportedTx**: `Extract`\<[`TxType`](enums/TxType.md), [`Bond`](enums/TxType.md#bond) \| [`Unbond`](enums/TxType.md#unbond) \| [`Transfer`](enums/TxType.md#transfer) \| [`IBCTransfer`](enums/TxType.md#ibctransfer) \| [`EthBridgeTransfer`](enums/TxType.md#ethbridgetransfer) \| [`Withdraw`](enums/TxType.md#withdraw) \| [`VoteProposal`](enums/TxType.md#voteproposal)\>

#### Defined in

[shared/src/types.ts:3](https://github.com/anoma/namada-interface/blob/7542445f/packages/shared/src/types.ts#L3)

___

### TransparentKeys

Ƭ **TransparentKeys**: \{ `privateKey`: `string`  } & [`Address`](modules.md#address)

Public and private keypair with address

#### Defined in

[sdk/src/keys/types.ts:12](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/keys/types.ts#L12)

___

### Unbonds

Ƭ **Unbonds**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `string` |
| `owner` | `string` |
| `startEpoch` | `string` |
| `validator` | `string` |
| `withdrawableEpoch` | `string` |

#### Defined in

[sdk/src/rpc/types.ts:34](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/rpc/types.ts#L34)

## Variables

### DEFAULT\_LEDGER\_BIP44\_PATH

• `Const` **DEFAULT\_LEDGER\_BIP44\_PATH**: `string`

#### Defined in

[sdk/src/ledger.ts:41](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/ledger.ts#L41)

___

### TxTypeLabel

• `Const` **TxTypeLabel**: `Record`\<[`TxType`](enums/TxType.md), `TxLabel`\>

#### Defined in

[shared/src/types.ts:24](https://github.com/anoma/namada-interface/blob/7542445f/packages/shared/src/types.ts#L24)

## Functions

### initLedgerHIDTransport

▸ **initLedgerHIDTransport**(): `Promise`\<`default`\>

Initialize HID transport

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:37](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/ledger.ts#L37)

___

### initLedgerUSBTransport

▸ **initLedgerUSBTransport**(): `Promise`\<`default`\>

Initialize USB transport

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:28](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/ledger.ts#L28)

___

### publicKeyToBech32

▸ **publicKeyToBech32**(`publicKey`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `publicKey` | `Uint8Array` |

#### Returns

`string`

#### Defined in

[sdk/src/keys/keys.ts:170](https://github.com/anoma/namada-interface/blob/7542445f/packages/sdk/src/keys/keys.ts#L170)

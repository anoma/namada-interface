[@namada/sdk](README.md) / Exports

# @namada/sdk

## Table of contents

### Enumerations

- [KdfType](enums/KdfType.md)
- [PhraseSize](enums/PhraseSize.md)
- [SdkEvents](enums/SdkEvents.md)
- [TxType](enums/TxType.md)

### Classes

- [Crypto](classes/Crypto.md)
- [Ledger](classes/Ledger.md)
- [Masp](classes/Masp.md)
- [Mnemonic](classes/Mnemonic.md)
- [ProgressBarNames](classes/ProgressBarNames.md)
- [Rpc](classes/Rpc.md)
- [Sdk](classes/Sdk.md)
- [Signing](classes/Signing.md)
- [Tx](classes/Tx.md)

### Type Aliases

- [Address](modules.md#address)
- [Argon2Params](modules.md#argon2params)
- [Balance](modules.md#balance)
- [Bonds](modules.md#bonds)
- [CryptoRecord](modules.md#cryptorecord)
- [DelegationTotals](modules.md#delegationtotals)
- [DelegatorsVotes](modules.md#delegatorsvotes)
- [EncryptionParams](modules.md#encryptionparams)
- [LedgerAddressAndPublicKey](modules.md#ledgeraddressandpublickey)
- [LedgerShieldedKeys](modules.md#ledgershieldedkeys)
- [LedgerStatus](modules.md#ledgerstatus)
- [ShieldedKeys](modules.md#shieldedkeys)
- [StakingPositions](modules.md#stakingpositions)
- [StakingTotals](modules.md#stakingtotals)
- [SupportedTx](modules.md#supportedtx)
- [TransparentKeys](modules.md#transparentkeys)
- [Unbonds](modules.md#unbonds)

### Variables

- [Argon2Config](modules.md#argon2config)
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

[sdk/src/keys/types.ts:4](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/keys/types.ts#L4)

___

### Argon2Params

Ƭ **Argon2Params**: `KdfParams` & \{ `m_cost`: `number` ; `p_cost`: `number` ; `salt`: `string` ; `t_cost`: `number`  }

#### Defined in

[sdk/src/crypto/types.ts:23](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/crypto/types.ts#L23)

___

### Balance

Ƭ **Balance**: [`string`, `string`][]

Balance
[tokenAddress, amount][]

#### Defined in

[sdk/src/rpc/types.ts:69](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L69)

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

[sdk/src/rpc/types.ts:27](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L27)

___

### CryptoRecord

Ƭ **CryptoRecord**\<`T`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | [`Argon2Params`](modules.md#argon2params) |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cipher` | \{ `iv`: `Uint8Array` ; `text`: `Uint8Array` ; `type`: ``"aes-256-gcm"``  } |
| `cipher.iv` | `Uint8Array` |
| `cipher.text` | `Uint8Array` |
| `cipher.type` | ``"aes-256-gcm"`` |
| `kdf` | \{ `params`: `T` ; `type`: [`KdfType`](enums/KdfType.md)  } |
| `kdf.params` | `T` |
| `kdf.type` | [`KdfType`](enums/KdfType.md) |

#### Defined in

[sdk/src/crypto/types.ts:42](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/crypto/types.ts#L42)

___

### DelegationTotals

Ƭ **DelegationTotals**: `Record`\<`string`, `number`\>

DelegationTotals
Record<address, totalDelegations>

#### Defined in

[sdk/src/rpc/types.ts:51](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L51)

___

### DelegatorsVotes

Ƭ **DelegatorsVotes**: `Record`\<`string`, `boolean`\>

Delegator Votes
Record<address, boolean>

#### Defined in

[sdk/src/rpc/types.ts:57](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L57)

___

### EncryptionParams

Ƭ **EncryptionParams**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `iv` | `Uint8Array` |
| `key` | `VecU8Pointer` |
| `params` | `Argon2ParamsWasm` |
| `salt` | `string` |

#### Defined in

[sdk/src/crypto/types.ts:30](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/crypto/types.ts#L30)

___

### LedgerAddressAndPublicKey

Ƭ **LedgerAddressAndPublicKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `publicKey` | `string` |

#### Defined in

[sdk/src/ledger.ts:19](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L19)

___

### LedgerShieldedKeys

Ƭ **LedgerShieldedKeys**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `proofGenerationKey` | \{ `ak?`: `string` ; `nsk?`: `string`  } |
| `proofGenerationKey.ak?` | `string` |
| `proofGenerationKey.nsk?` | `string` |
| `viewingKey` | \{ `ivk?`: `string` ; `ovk?`: `string` ; `viewKey?`: `string`  } |
| `viewingKey.ivk?` | `string` |
| `viewingKey.ovk?` | `string` |
| `viewingKey.viewKey?` | `string` |

#### Defined in

[sdk/src/ledger.ts:20](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L20)

___

### LedgerStatus

Ƭ **LedgerStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `info` | `ResponseAppInfo` |
| `version` | `ResponseVersion` |

#### Defined in

[sdk/src/ledger.ts:32](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L32)

___

### ShieldedKeys

Ƭ **ShieldedKeys**: `Object`

Shielded keys and address

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `pseudoExtendedKey` | `string` |
| `spendingKey` | `string` |
| `viewingKey` | `string` |

#### Defined in

[sdk/src/keys/types.ts:19](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/keys/types.ts#L19)

___

### StakingPositions

Ƭ **StakingPositions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bonds` | [`Bonds`](modules.md#bonds)[] |
| `unbonds` | [`Unbonds`](modules.md#unbonds)[] |

#### Defined in

[sdk/src/rpc/types.ts:42](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L42)

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

[sdk/src/rpc/types.ts:19](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L19)

___

### SupportedTx

Ƭ **SupportedTx**: `Extract`\<[`TxType`](enums/TxType.md), [`Bond`](enums/TxType.md#bond) \| [`Unbond`](enums/TxType.md#unbond) \| [`Transfer`](enums/TxType.md#transfer) \| [`IBCTransfer`](enums/TxType.md#ibctransfer) \| [`EthBridgeTransfer`](enums/TxType.md#ethbridgetransfer) \| [`Withdraw`](enums/TxType.md#withdraw) \| [`VoteProposal`](enums/TxType.md#voteproposal) \| [`Redelegate`](enums/TxType.md#redelegate)\>

#### Defined in

[shared/src/types.ts:3](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/shared/src/types.ts#L3)

___

### TransparentKeys

Ƭ **TransparentKeys**: \{ `privateKey`: `string`  } & [`Address`](modules.md#address)

Public and private keypair with address

#### Defined in

[sdk/src/keys/types.ts:12](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/keys/types.ts#L12)

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

[sdk/src/rpc/types.ts:34](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/rpc/types.ts#L34)

## Variables

### Argon2Config

• `Const` **Argon2Config**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `m_cost` | `number` |
| `p_cost` | `number` |
| `t_cost` | `number` |

#### Defined in

[sdk/src/crypto/types.ts:3](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/crypto/types.ts#L3)

___

### TxTypeLabel

• `Const` **TxTypeLabel**: `Record`\<[`TxType`](enums/TxType.md), `TxLabel`\>

#### Defined in

[shared/src/types.ts:28](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/shared/src/types.ts#L28)

## Functions

### initLedgerHIDTransport

▸ **initLedgerHIDTransport**(): `Promise`\<`default`\>

Initialize HID transport

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:51](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L51)

___

### initLedgerUSBTransport

▸ **initLedgerUSBTransport**(): `Promise`\<`default`\>

Initialize USB transport

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:42](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/ledger.ts#L42)

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

[sdk/src/keys/keys.ts:245](https://github.com/anoma/namada-interface/blob/04cc0e2c5bbf957adca124841118cb1e5cb7bcab/packages/sdk/src/keys/keys.ts#L245)

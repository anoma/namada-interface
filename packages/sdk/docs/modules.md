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
- [ExtendedViewingKey](classes/ExtendedViewingKey.md)
- [Keys](classes/Keys.md)
- [Ledger](classes/Ledger.md)
- [Masp](classes/Masp.md)
- [Mnemonic](classes/Mnemonic.md)
- [ProgressBarNames](classes/ProgressBarNames.md)
- [ProofGenerationKey](classes/ProofGenerationKey.md)
- [PseudoExtendedKey](classes/PseudoExtendedKey.md)
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
- [GeneratedPaymentAddress](modules.md#generatedpaymentaddress)
- [LedgerAddressAndPublicKey](modules.md#ledgeraddressandpublickey)
- [LedgerProofGenerationKey](modules.md#ledgerproofgenerationkey)
- [LedgerStatus](modules.md#ledgerstatus)
- [LedgerViewingKey](modules.md#ledgerviewingkey)
- [ShieldedKeys](modules.md#shieldedkeys)
- [StakingPositions](modules.md#stakingpositions)
- [StakingTotals](modules.md#stakingtotals)
- [SupportedTx](modules.md#supportedtx)
- [TransparentKeys](modules.md#transparentkeys)
- [Unbonds](modules.md#unbonds)

### Variables

- [Argon2Config](modules.md#argon2config)
- [DEFAULT\_BIP44\_PATH](modules.md#default_bip44_path)
- [DEFAULT\_ZIP32\_PATH](modules.md#default_zip32_path)
- [LEDGER\_MASP\_BLACKLISTED](modules.md#ledger_masp_blacklisted)
- [LEDGER\_MIN\_VERSION\_ZIP32](modules.md#ledger_min_version_zip32)
- [MODIFIED\_ZIP32\_PATH](modules.md#modified_zip32_path)
- [TxTypeLabel](modules.md#txtypelabel)

### Functions

- [initLedgerUSBTransport](modules.md#initledgerusbtransport)
- [ledgerUSBList](modules.md#ledgerusblist)
- [publicKeyToBech32](modules.md#publickeytobech32)
- [requestLedgerDevice](modules.md#requestledgerdevice)

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

[sdk/src/keys/types.ts:6](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L6)

___

### Argon2Params

Ƭ **Argon2Params**: `KdfParams` & \{ `m_cost`: `number` ; `p_cost`: `number` ; `salt`: `string` ; `t_cost`: `number`  }

#### Defined in

[sdk/src/crypto/types.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/types.ts#L23)

___

### Balance

Ƭ **Balance**: [`string`, `string`][]

Balance
[tokenAddress, amount][]

#### Defined in

[sdk/src/rpc/types.ts:78](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L78)

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

[sdk/src/rpc/types.ts:27](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L27)

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

[sdk/src/crypto/types.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/types.ts#L42)

___

### DelegationTotals

Ƭ **DelegationTotals**: `Record`\<`string`, `number`\>

DelegationTotals
Record<address, totalDelegations>

#### Defined in

[sdk/src/rpc/types.ts:60](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L60)

___

### DelegatorsVotes

Ƭ **DelegatorsVotes**: `Record`\<`string`, `boolean`\>

Delegator Votes
Record<address, boolean>

#### Defined in

[sdk/src/rpc/types.ts:66](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L66)

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

[sdk/src/crypto/types.ts:30](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/types.ts#L30)

___

### GeneratedPaymentAddress

Ƭ **GeneratedPaymentAddress**: `Object`

Result of generating next payment address

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `diversifierIndex` | `number` |

#### Defined in

[sdk/src/keys/types.ts:32](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L32)

___

### LedgerAddressAndPublicKey

Ƭ **LedgerAddressAndPublicKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `publicKey` | `string` |

#### Defined in

[sdk/src/ledger.ts:19](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L19)

___

### LedgerProofGenerationKey

Ƭ **LedgerProofGenerationKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ak` | `Uint8Array` |
| `nsk` | `Uint8Array` |

#### Defined in

[sdk/src/ledger.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L23)

___

### LedgerStatus

Ƭ **LedgerStatus**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deviceId?` | `string` |
| `deviceName?` | `string` |
| `info` | `ResponseAppInfo` |
| `version` | `ResponseVersion` |

#### Defined in

[sdk/src/ledger.ts:28](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L28)

___

### LedgerViewingKey

Ƭ **LedgerViewingKey**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `xfvk` | `Uint8Array` |

#### Defined in

[sdk/src/ledger.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L20)

___

### ShieldedKeys

Ƭ **ShieldedKeys**: `Object`

Shielded keys and address

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `diversifierIndex` | `number` |
| `pseudoExtendedKey` | `string` |
| `spendingKey` | `string` |
| `viewingKey` | `string` |

#### Defined in

[sdk/src/keys/types.ts:21](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L21)

___

### StakingPositions

Ƭ **StakingPositions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bonds` | [`Bonds`](modules.md#bonds)[] |
| `unbonds` | [`Unbonds`](modules.md#unbonds)[] |

#### Defined in

[sdk/src/rpc/types.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L42)

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

[sdk/src/rpc/types.ts:19](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L19)

___

### SupportedTx

Ƭ **SupportedTx**: `Extract`\<[`TxType`](enums/TxType.md), [`Bond`](enums/TxType.md#bond) \| [`Unbond`](enums/TxType.md#unbond) \| [`Transfer`](enums/TxType.md#transfer) \| [`IBCTransfer`](enums/TxType.md#ibctransfer) \| [`EthBridgeTransfer`](enums/TxType.md#ethbridgetransfer) \| [`Withdraw`](enums/TxType.md#withdraw) \| [`VoteProposal`](enums/TxType.md#voteproposal) \| [`Redelegate`](enums/TxType.md#redelegate)\>

#### Defined in

[shared/src/types.ts:3](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/shared/src/types.ts#L3)

___

### TransparentKeys

Ƭ **TransparentKeys**: \{ `privateKey`: `string`  } & [`Address`](modules.md#address)

Public and private keypair with address

#### Defined in

[sdk/src/keys/types.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L14)

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

[sdk/src/rpc/types.ts:34](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/rpc/types.ts#L34)

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

[sdk/src/crypto/types.ts:3](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/crypto/types.ts#L3)

___

### DEFAULT\_BIP44\_PATH

• `Const` **DEFAULT\_BIP44\_PATH**: `Bip44Path`

#### Defined in

[sdk/src/keys/types.ts:37](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L37)

___

### DEFAULT\_ZIP32\_PATH

• `Const` **DEFAULT\_ZIP32\_PATH**: `Zip32Path`

#### Defined in

[sdk/src/keys/types.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L49)

___

### LEDGER\_MASP\_BLACKLISTED

• `Const` **LEDGER\_MASP\_BLACKLISTED**: ``"nanoS"``

#### Defined in

[sdk/src/ledger.ts:36](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L36)

___

### LEDGER\_MIN\_VERSION\_ZIP32

• `Const` **LEDGER\_MIN\_VERSION\_ZIP32**: ``"3.0.0"``

#### Defined in

[sdk/src/ledger.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L35)

___

### MODIFIED\_ZIP32\_PATH

• `Const` **MODIFIED\_ZIP32\_PATH**: `Bip44Path`

#### Defined in

[sdk/src/keys/types.ts:43](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/types.ts#L43)

___

### TxTypeLabel

• `Const` **TxTypeLabel**: `Record`\<[`TxType`](enums/TxType.md), `TxLabel`\>

#### Defined in

[shared/src/types.ts:28](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/shared/src/types.ts#L28)

## Functions

### initLedgerUSBTransport

▸ **initLedgerUSBTransport**(): `Promise`\<`default`\>

Initialize USB transport

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:57](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L57)

___

### ledgerUSBList

▸ **ledgerUSBList**(): `Promise`\<`USBDevice`[]\>

Returns a list of ledger devices

#### Returns

`Promise`\<`USBDevice`[]\>

List of USB devices

**`Async`**

#### Defined in

[sdk/src/ledger.ts:66](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L66)

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

[sdk/src/keys/keys.ts:281](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/keys/keys.ts#L281)

___

### requestLedgerDevice

▸ **requestLedgerDevice**(): `Promise`\<`default`\>

Request ledger device - opens a popup to request the user to connect a ledger device

#### Returns

`Promise`\<`default`\>

Transport object

**`Async`**

#### Defined in

[sdk/src/ledger.ts:75](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/sdk/src/ledger.ts#L75)

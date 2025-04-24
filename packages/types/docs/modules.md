[@namada/types](README.md) / Exports

# @namada/types

## Table of contents

### Enumerations

- [AccountType](enums/AccountType.md)
- [BridgeType](enums/BridgeType.md)
- [Events](enums/Events.md)
- [KeplrEvents](enums/KeplrEvents.md)
- [MetamaskEvents](enums/MetamaskEvents.md)
- [ResultCode](enums/ResultCode.md)

### Classes

- [BatchTxResultMsgValue](classes/BatchTxResultMsgValue.md)
- [BondMsgValue](classes/BondMsgValue.md)
- [BparamsConvertMsgValue](classes/BparamsConvertMsgValue.md)
- [BparamsMsgValue](classes/BparamsMsgValue.md)
- [BparamsOutputMsgValue](classes/BparamsOutputMsgValue.md)
- [BparamsSpendMsgValue](classes/BparamsSpendMsgValue.md)
- [BroadcastTxError](classes/BroadcastTxError.md)
- [ClaimRewardsMsgValue](classes/ClaimRewardsMsgValue.md)
- [CommitmentMsgValue](classes/CommitmentMsgValue.md)
- [EthBridgeTransferMsgValue](classes/EthBridgeTransferMsgValue.md)
- [IbcTransferMsgValue](classes/IbcTransferMsgValue.md)
- [MaspTxIn](classes/MaspTxIn.md)
- [MaspTxOut](classes/MaspTxOut.md)
- [Message](classes/Message.md)
- [RedelegateMsgValue](classes/RedelegateMsgValue.md)
- [RevealPkMsgValue](classes/RevealPkMsgValue.md)
- [ShieldedTransferDataMsgValue](classes/ShieldedTransferDataMsgValue.md)
- [ShieldedTransferMsgValue](classes/ShieldedTransferMsgValue.md)
- [ShieldingTransferDataMsgValue](classes/ShieldingTransferDataMsgValue.md)
- [ShieldingTransferMsgValue](classes/ShieldingTransferMsgValue.md)
- [SignatureMsgValue](classes/SignatureMsgValue.md)
- [SigningDataMsgValue](classes/SigningDataMsgValue.md)
- [TransferDataMsgValue](classes/TransferDataMsgValue.md)
- [TransferDetailsMsgValue](classes/TransferDetailsMsgValue.md)
- [TransferMsgValue](classes/TransferMsgValue.md)
- [TransparentTransferDataMsgValue](classes/TransparentTransferDataMsgValue.md)
- [TransparentTransferMsgValue](classes/TransparentTransferMsgValue.md)
- [TxDetailsMsgValue](classes/TxDetailsMsgValue.md)
- [TxMsgValue](classes/TxMsgValue.md)
- [TxResponseMsgValue](classes/TxResponseMsgValue.md)
- [UnbondMsgValue](classes/UnbondMsgValue.md)
- [UnshieldingTransferDataMsgValue](classes/UnshieldingTransferDataMsgValue.md)
- [UnshieldingTransferMsgValue](classes/UnshieldingTransferMsgValue.md)
- [VoteProposalMsgValue](classes/VoteProposalMsgValue.md)
- [WithdrawMsgValue](classes/WithdrawMsgValue.md)
- [WrapperTxMsgValue](classes/WrapperTxMsgValue.md)

### Interfaces

- [IMessage](interfaces/IMessage.md)
- [Namada](interfaces/Namada.md)
- [Signer](interfaces/Signer.md)

### Type Aliases

- [Account](modules.md#account)
- [AddRemove](modules.md#addremove)
- [BalancesProps](modules.md#balancesprops)
- [BatchTxResultProps](modules.md#batchtxresultprops)
- [Bip44Path](modules.md#bip44path)
- [BondProps](modules.md#bondprops)
- [Chain](modules.md#chain)
- [ChainKey](modules.md#chainkey)
- [ClaimRewardsProps](modules.md#claimrewardsprops)
- [ClearDisposableSignerProps](modules.md#cleardisposablesignerprops)
- [CommitmentDetailProps](modules.md#commitmentdetailprops)
- [CosmosMinDenom](modules.md#cosmosmindenom)
- [CosmosTokenType](modules.md#cosmostokentype)
- [Currency](modules.md#currency)
- [DatedViewingKey](modules.md#datedviewingkey)
- [Default](modules.md#default)
- [DefaultWithWasm](modules.md#defaultwithwasm)
- [DelegatorVote](modules.md#delegatorvote)
- [DerivedAccount](modules.md#derivedaccount)
- [EthBridgeTransferProps](modules.md#ethbridgetransferprops)
- [ExtensionInfo](modules.md#extensioninfo)
- [ExtensionKey](modules.md#extensionkey)
- [GenDisposableSignerResponse](modules.md#gendisposablesignerresponse)
- [IbcTransferProps](modules.md#ibctransferprops)
- [JsonCompatibleArray](modules.md#jsoncompatiblearray)
- [JsonCompatibleDictionary](modules.md#jsoncompatibledictionary)
- [MaspTxInProps](modules.md#masptxinprops)
- [MaspTxOutProps](modules.md#masptxoutprops)
- [NamadaKeychainAccount](modules.md#namadakeychainaccount)
- [Path](modules.md#path)
- [PersistDisposableSignerProps](modules.md#persistdisposablesignerprops)
- [PgfActions](modules.md#pgfactions)
- [PgfIbcTarget](modules.md#pgfibctarget)
- [PgfPayment](modules.md#pgfpayment)
- [PgfSteward](modules.md#pgfsteward)
- [PgfTarget](modules.md#pgftarget)
- [Proposal](modules.md#proposal)
- [ProposalStatus](modules.md#proposalstatus)
- [ProposalType](modules.md#proposaltype)
- [ProposalTypeString](modules.md#proposaltypestring)
- [RedelegateProps](modules.md#redelegateprops)
- [RevealPkProps](modules.md#revealpkprops)
- [Schema](modules.md#schema)
- [ShieldedTransferDataProps](modules.md#shieldedtransferdataprops)
- [ShieldedTransferProps](modules.md#shieldedtransferprops)
- [ShieldingTransferDataProps](modules.md#shieldingtransferdataprops)
- [ShieldingTransferProps](modules.md#shieldingtransferprops)
- [SignArbitraryProps](modules.md#signarbitraryprops)
- [SignArbitraryResponse](modules.md#signarbitraryresponse)
- [SignProps](modules.md#signprops)
- [SignatureProps](modules.md#signatureprops)
- [SigningDataProps](modules.md#signingdataprops)
- [SupportedTxProps](modules.md#supportedtxprops)
- [TallyType](modules.md#tallytype)
- [TokenBalances](modules.md#tokenbalances)
- [TokenInfo](modules.md#tokeninfo)
- [TokenType](modules.md#tokentype)
- [TransferDetailsProps](modules.md#transferdetailsprops)
- [TransferProps](modules.md#transferprops)
- [TransparentTransferDataProps](modules.md#transparenttransferdataprops)
- [TransparentTransferProps](modules.md#transparenttransferprops)
- [TxDetails](modules.md#txdetails)
- [TxProps](modules.md#txprops)
- [TxResponseProps](modules.md#txresponseprops)
- [UnbondProps](modules.md#unbondprops)
- [UnknownVoteType](modules.md#unknownvotetype)
- [UnshieldingTransferDataProps](modules.md#unshieldingtransferdataprops)
- [UnshieldingTransferProps](modules.md#unshieldingtransferprops)
- [ValidatorVote](modules.md#validatorvote)
- [VerifyArbitraryProps](modules.md#verifyarbitraryprops)
- [Vote](modules.md#vote)
- [VoteProposalProps](modules.md#voteproposalprops)
- [VoteType](modules.md#votetype)
- [Votes](modules.md#votes)
- [WindowWithNamada](modules.md#windowwithnamada)
- [WithdrawProps](modules.md#withdrawprops)
- [WrapperTxProps](modules.md#wrappertxprops)
- [Zip32Path](modules.md#zip32path)

### Variables

- [BigNumberSerializer](modules.md#bignumberserializer)
- [CosmosSymbols](modules.md#cosmossymbols)
- [CosmosTokens](modules.md#cosmostokens)
- [Extensions](modules.md#extensions)
- [NamadaChains](modules.md#namadachains)
- [ResultCodes](modules.md#resultcodes)
- [Symbols](modules.md#symbols)
- [Tokens](modules.md#tokens)
- [proposalStatuses](modules.md#proposalstatuses)
- [tallyTypes](modules.md#tallytypes)
- [voteTypes](modules.md#votetypes)

### Functions

- [isDelegatorVote](modules.md#isdelegatorvote)
- [isProposalStatus](modules.md#isproposalstatus)
- [isTallyType](modules.md#istallytype)
- [isValidatorVote](modules.md#isvalidatorvote)
- [isVoteType](modules.md#isvotetype)
- [minDenomByToken](modules.md#mindenombytoken)
- [tokenByMinDenom](modules.md#tokenbymindenom)

## Type Aliases

### Account

Ƭ **Account**: `Pick`\<[`DerivedAccount`](modules.md#derivedaccount), ``"address"`` \| ``"alias"`` \| ``"type"`` \| ``"publicKey"`` \| ``"owner"`` \| ``"pseudoExtendedKey"`` \| ``"source"`` \| ``"timestamp"`` \| ``"diversifierIndex"``\> & \{ `viewingKey?`: `string`  }

#### Defined in

[packages/types/src/account.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L49)

___

### AddRemove

Ƭ **AddRemove**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `add?` | `string` |
| `remove` | `string`[] |

#### Defined in

[packages/types/src/proposals.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L35)

___

### BalancesProps

Ƭ **BalancesProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `owner` | `string` |
| `tokens` | `string`[] |

#### Defined in

[packages/types/src/namada.ts:26](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L26)

___

### BatchTxResultProps

Ƭ **BatchTxResultProps**: [`BatchTxResultMsgValue`](classes/BatchTxResultMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:31](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L31)

___

### Bip44Path

Ƭ **Bip44Path**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `number` |
| `change` | `number` |
| `index` | `number` |

#### Defined in

[packages/types/src/account.ts:1](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L1)

___

### BondProps

Ƭ **BondProps**: [`BondMsgValue`](classes/BondMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:32](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L32)

___

### Chain

Ƭ **Chain**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `bech32Prefix` | `string` |
| `bip44` | \{ `coinType`: `number`  } |
| `bip44.coinType` | `number` |
| `bridgeType` | [`BridgeType`](enums/BridgeType.md)[] |
| `chainId` | `string` |
| `currency` | [`Currency`](modules.md#currency) |
| `extension` | [`ExtensionInfo`](modules.md#extensioninfo) |
| `ibc?` | \{ `portId`: `string`  } |
| `ibc.portId` | `string` |
| `id` | [`ChainKey`](modules.md#chainkey) |
| `rpc` | `string` |

#### Defined in

[packages/types/src/chain.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L49)

___

### ChainKey

Ƭ **ChainKey**: ``"namada"`` \| ``"cosmos"`` \| ``"ethereum"``

#### Defined in

[packages/types/src/chain.ts:21](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L21)

___

### ClaimRewardsProps

Ƭ **ClaimRewardsProps**: [`ClaimRewardsMsgValue`](classes/ClaimRewardsMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:54](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L54)

___

### ClearDisposableSignerProps

Ƭ **ClearDisposableSignerProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Defined in

[packages/types/src/namada.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L35)

___

### CommitmentDetailProps

Ƭ **CommitmentDetailProps**: [`SupportedTxProps`](modules.md#supportedtxprops) & \{ `hash`: `string` ; `maspTxIn?`: [`MaspTxIn`](classes/MaspTxIn.md)[] ; `maspTxOut?`: [`MaspTxOut`](classes/MaspTxOut.md)[] ; `memo?`: `string` ; `txType`: `unknown`  }

#### Defined in

[packages/types/src/tx/types.ts:72](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L72)

___

### CosmosMinDenom

Ƭ **CosmosMinDenom**: typeof `cosmosMinDenoms`[`number`]

#### Defined in

[packages/types/src/tokens/Cosmos.ts:13](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L13)

___

### CosmosTokenType

Ƭ **CosmosTokenType**: typeof [`CosmosSymbols`](modules.md#cosmossymbols)[`number`]

#### Defined in

[packages/types/src/tokens/Cosmos.ts:6](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L6)

___

### Currency

Ƭ **Currency**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address?` | `string` |
| `gasPriceStep?` | \{ `average`: `number` ; `high`: `number` ; `low`: `number`  } |
| `gasPriceStep.average` | `number` |
| `gasPriceStep.high` | `number` |
| `gasPriceStep.low` | `number` |
| `symbol` | `string` |
| `token` | `string` |

#### Defined in

[packages/types/src/chain.ts:1](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L1)

___

### DatedViewingKey

Ƭ **DatedViewingKey**: `Object`

ViewingKey with optional birthday

#### Type declaration

| Name | Type |
| :------ | :------ |
| `birthday` | `number` |
| `key` | `string` |

#### Defined in

[packages/types/src/account.ts:72](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L72)

___

### Default

Ƭ **Default**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | ``"default"`` |

#### Defined in

[packages/types/src/proposals.ts:64](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L64)

___

### DefaultWithWasm

Ƭ **DefaultWithWasm**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `type` | ``"default_with_wasm"`` |

#### Defined in

[packages/types/src/proposals.ts:65](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L65)

___

### DelegatorVote

Ƭ **DelegatorVote**: \{ `isValidator`: ``false`` ; `votingPower`: [`string`, `BigNumber`][]  } & `VoteCommonProperties`

#### Defined in

[packages/types/src/proposals.ts:94](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L94)

___

### DerivedAccount

Ƭ **DerivedAccount**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `alias` | `string` |
| `diversifierIndex?` | `number` |
| `id` | `string` |
| `modifiedZip32Path?` | `string` |
| `owner?` | `string` |
| `parentId?` | `string` |
| `path` | [`Path`](modules.md#path) |
| `pseudoExtendedKey?` | `string` |
| `publicKey?` | `string` |
| `source?` | ``"imported"`` \| ``"generated"`` |
| `timestamp?` | `number` |
| `type` | [`AccountType`](enums/AccountType.md) |

#### Defined in

[packages/types/src/account.ts:33](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L33)

___

### EthBridgeTransferProps

Ƭ **EthBridgeTransferProps**: [`EthBridgeTransferMsgValue`](classes/EthBridgeTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:33](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L33)

___

### ExtensionInfo

Ƭ **ExtensionInfo**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alias` | `string` |
| `id` | [`ExtensionKey`](modules.md#extensionkey) |
| `url` | `string` |

#### Defined in

[packages/types/src/chain.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L23)

___

### ExtensionKey

Ƭ **ExtensionKey**: ``"namada"`` \| ``"keplr"`` \| ``"metamask"``

#### Defined in

[packages/types/src/chain.ts:18](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L18)

___

### GenDisposableSignerResponse

Ƭ **GenDisposableSignerResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `publicKey` | `string` |

#### Defined in

[packages/types/src/signer.ts:8](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L8)

___

### IbcTransferProps

Ƭ **IbcTransferProps**: [`IbcTransferMsgValue`](classes/IbcTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:34](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L34)

___

### JsonCompatibleArray

Ƭ **JsonCompatibleArray**: (`string` \| `number` \| `boolean`)[]

#### Defined in

[packages/types/src/utils.ts:1](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/utils.ts#L1)

___

### JsonCompatibleDictionary

Ƭ **JsonCompatibleDictionary**: `Object`

#### Index signature

▪ [key: `string`]: `string` \| [`JsonCompatibleArray`](modules.md#jsoncompatiblearray)

#### Defined in

[packages/types/src/utils.ts:2](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/utils.ts#L2)

___

### MaspTxInProps

Ƭ **MaspTxInProps**: [`MaspTxIn`](classes/MaspTxIn.md)

#### Defined in

[packages/types/src/tx/types.ts:44](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L44)

___

### MaspTxOutProps

Ƭ **MaspTxOutProps**: [`MaspTxOut`](classes/MaspTxOut.md)

#### Defined in

[packages/types/src/tx/types.ts:45](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L45)

___

### NamadaKeychainAccount

Ƭ **NamadaKeychainAccount**: [`Account`](modules.md#account) & \{ `id`: `string` ; `parentId?`: `string`  }

#### Defined in

[packages/types/src/account.ts:64](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L64)

___

### Path

Ƭ **Path**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `number` |
| `change?` | `number` |
| `index?` | `number` |

#### Defined in

[packages/types/src/account.ts:13](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L13)

___

### PersistDisposableSignerProps

Ƭ **PersistDisposableSignerProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Defined in

[packages/types/src/namada.ts:31](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L31)

___

### PgfActions

Ƭ **PgfActions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `continuous` | \{ `add`: ([`PgfTarget`](modules.md#pgftarget) \| [`PgfIbcTarget`](modules.md#pgfibctarget))[] ; `remove`: ([`PgfTarget`](modules.md#pgftarget) \| [`PgfIbcTarget`](modules.md#pgfibctarget))[]  } |
| `continuous.add` | ([`PgfTarget`](modules.md#pgftarget) \| [`PgfIbcTarget`](modules.md#pgfibctarget))[] |
| `continuous.remove` | ([`PgfTarget`](modules.md#pgftarget) \| [`PgfIbcTarget`](modules.md#pgfibctarget))[] |
| `retro` | ([`PgfTarget`](modules.md#pgftarget) \| [`PgfIbcTarget`](modules.md#pgfibctarget))[] |

#### Defined in

[packages/types/src/proposals.ts:56](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L56)

___

### PgfIbcTarget

Ƭ **PgfIbcTarget**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `ibc` | \{ `amount`: `BigNumber` ; `channelId`: `string` ; `portId`: `string` ; `target`: `string`  } |
| `ibc.amount` | `BigNumber` |
| `ibc.channelId` | `string` |
| `ibc.portId` | `string` |
| `ibc.target` | `string` |

#### Defined in

[packages/types/src/proposals.ts:47](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L47)

___

### PgfPayment

Ƭ **PgfPayment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | [`PgfActions`](modules.md#pgfactions) |
| `type` | ``"pgf_payment"`` |

#### Defined in

[packages/types/src/proposals.ts:67](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L67)

___

### PgfSteward

Ƭ **PgfSteward**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | [`AddRemove`](modules.md#addremove) |
| `type` | ``"pgf_steward"`` |

#### Defined in

[packages/types/src/proposals.ts:66](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L66)

___

### PgfTarget

Ƭ **PgfTarget**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `internal` | \{ `amount`: `BigNumber` ; `target`: `string`  } |
| `internal.amount` | `BigNumber` |
| `internal.target` | `string` |

#### Defined in

[packages/types/src/proposals.ts:40](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L40)

___

### Proposal

Ƭ **Proposal**: \{ `activationEpoch`: `bigint` ; `activationTime`: `bigint` ; `author`: `string` ; `content`: \{ `[key: string]`: `string` \| `undefined`;  } ; `currentTime`: `bigint` ; `endEpoch`: `bigint` ; `endTime`: `bigint` ; `id`: `bigint` ; `proposalType`: [`ProposalType`](modules.md#proposaltype) ; `startEpoch`: `bigint` ; `startTime`: `bigint` ; `status`: [`ProposalStatus`](modules.md#proposalstatus) ; `tallyType`: [`TallyType`](modules.md#tallytype) ; `totalVotingPower`: `BigNumber`  } & \{ [VT in VoteType]: BigNumber }

#### Defined in

[packages/types/src/proposals.ts:16](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L16)

___

### ProposalStatus

Ƭ **ProposalStatus**: typeof [`proposalStatuses`](modules.md#proposalstatuses)[`number`]

#### Defined in

[packages/types/src/proposals.ts:11](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L11)

___

### ProposalType

Ƭ **ProposalType**: [`Default`](modules.md#default) \| [`DefaultWithWasm`](modules.md#defaultwithwasm) \| [`PgfSteward`](modules.md#pgfsteward) \| [`PgfPayment`](modules.md#pgfpayment)

#### Defined in

[packages/types/src/proposals.ts:68](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L68)

___

### ProposalTypeString

Ƭ **ProposalTypeString**: [`ProposalType`](modules.md#proposaltype)[``"type"``]

#### Defined in

[packages/types/src/proposals.ts:70](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L70)

___

### RedelegateProps

Ƭ **RedelegateProps**: [`RedelegateMsgValue`](classes/RedelegateMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:35](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L35)

___

### RevealPkProps

Ƭ **RevealPkProps**: [`RevealPkMsgValue`](classes/RevealPkMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:57](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L57)

___

### Schema

Ƭ **Schema**: [`BatchTxResultMsgValue`](classes/BatchTxResultMsgValue.md) \| [`EthBridgeTransferMsgValue`](classes/EthBridgeTransferMsgValue.md) \| [`IbcTransferMsgValue`](classes/IbcTransferMsgValue.md) \| [`SignatureMsgValue`](classes/SignatureMsgValue.md) \| [`BondMsgValue`](classes/BondMsgValue.md) \| [`UnbondMsgValue`](classes/UnbondMsgValue.md) \| [`VoteProposalMsgValue`](classes/VoteProposalMsgValue.md) \| [`ClaimRewardsMsgValue`](classes/ClaimRewardsMsgValue.md) \| [`WithdrawMsgValue`](classes/WithdrawMsgValue.md) \| [`ShieldedTransferMsgValue`](classes/ShieldedTransferMsgValue.md) \| [`ShieldedTransferDataMsgValue`](classes/ShieldedTransferDataMsgValue.md) \| [`ShieldingTransferMsgValue`](classes/ShieldingTransferMsgValue.md) \| [`ShieldingTransferDataMsgValue`](classes/ShieldingTransferDataMsgValue.md) \| [`SigningDataMsgValue`](classes/SigningDataMsgValue.md) \| [`TransferMsgValue`](classes/TransferMsgValue.md) \| [`TransferDetailsMsgValue`](classes/TransferDetailsMsgValue.md) \| [`TransferDataMsgValue`](classes/TransferDataMsgValue.md) \| [`TransparentTransferMsgValue`](classes/TransparentTransferMsgValue.md) \| [`TransparentTransferDataMsgValue`](classes/TransparentTransferDataMsgValue.md) \| [`TxMsgValue`](classes/TxMsgValue.md) \| [`TxResponseMsgValue`](classes/TxResponseMsgValue.md) \| [`UnshieldingTransferDataMsgValue`](classes/UnshieldingTransferDataMsgValue.md) \| [`UnshieldingTransferMsgValue`](classes/UnshieldingTransferMsgValue.md) \| [`WrapperTxMsgValue`](classes/WrapperTxMsgValue.md) \| [`RedelegateMsgValue`](classes/RedelegateMsgValue.md) \| [`CommitmentMsgValue`](classes/CommitmentMsgValue.md) \| [`TxDetailsMsgValue`](classes/TxDetailsMsgValue.md) \| [`RevealPkMsgValue`](classes/RevealPkMsgValue.md)

#### Defined in

[packages/types/src/tx/schema/index.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/index.ts#L49)

___

### ShieldedTransferDataProps

Ƭ **ShieldedTransferDataProps**: [`ShieldedTransferDataMsgValue`](classes/ShieldedTransferDataMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:38](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L38)

___

### ShieldedTransferProps

Ƭ **ShieldedTransferProps**: [`ShieldedTransferMsgValue`](classes/ShieldedTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:37](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L37)

___

### ShieldingTransferDataProps

Ƭ **ShieldingTransferDataProps**: [`ShieldingTransferDataMsgValue`](classes/ShieldingTransferDataMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:40](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L40)

___

### ShieldingTransferProps

Ƭ **ShieldingTransferProps**: [`ShieldingTransferMsgValue`](classes/ShieldingTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:39](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L39)

___

### SignArbitraryProps

Ƭ **SignArbitraryProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `signer` | `string` |

#### Defined in

[packages/types/src/namada.ts:9](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L9)

___

### SignArbitraryResponse

Ƭ **SignArbitraryResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `signature` | `string` |

#### Defined in

[packages/types/src/signer.ts:3](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/signer.ts#L3)

___

### SignProps

Ƭ **SignProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `checksums?` | `Record`\<`string`, `string`\> |
| `signer` | `string` |
| `txs` | [`TxProps`](modules.md#txprops)[] |

#### Defined in

[packages/types/src/namada.ts:14](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L14)

___

### SignatureProps

Ƭ **SignatureProps**: [`SignatureMsgValue`](classes/SignatureMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:36](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L36)

___

### SigningDataProps

Ƭ **SigningDataProps**: [`SigningDataMsgValue`](classes/SigningDataMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:51](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L51)

___

### SupportedTxProps

Ƭ **SupportedTxProps**: [`BondProps`](modules.md#bondprops) \| [`UnbondProps`](modules.md#unbondprops) \| [`WithdrawProps`](modules.md#withdrawprops) \| [`RedelegateProps`](modules.md#redelegateprops) \| [`EthBridgeTransferProps`](modules.md#ethbridgetransferprops) \| [`IbcTransferProps`](modules.md#ibctransferprops) \| [`VoteProposalProps`](modules.md#voteproposalprops) \| [`ClaimRewardsProps`](modules.md#claimrewardsprops) \| [`TransferProps`](modules.md#transferprops) \| [`TransferDetailsProps`](modules.md#transferdetailsprops) \| [`RevealPkProps`](modules.md#revealpkprops)

#### Defined in

[packages/types/src/tx/types.ts:59](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L59)

___

### TallyType

Ƭ **TallyType**: typeof [`tallyTypes`](modules.md#tallytypes)[`number`]

#### Defined in

[packages/types/src/proposals.ts:110](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L110)

___

### TokenBalances

Ƭ **TokenBalances**\<`T`\>: `Partial`\<`Record`\<`T`, `BigNumber`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` = [`TokenType`](modules.md#tokentype) |

#### Defined in

[packages/types/src/tokens/types.ts:19](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/types.ts#L19)

___

### TokenInfo

Ƭ **TokenInfo**\<`D`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `D` | extends `string` = `string` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `coin` | `string` |
| `coinGeckoId?` | `string` |
| `decimals` | `number` |
| `isNut?` | `boolean` |
| `minDenom` | `D` |
| `nativeAddress?` | `string` |
| `path` | `number` |
| `symbol` | `string` |
| `type` | `number` |
| `url?` | `string` |

#### Defined in

[packages/types/src/tokens/types.ts:5](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/types.ts#L5)

___

### TokenType

Ƭ **TokenType**: typeof [`Symbols`](modules.md#symbols)[`number`]

#### Defined in

[packages/types/src/tokens/Namada.ts:21](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Namada.ts#L21)

___

### TransferDetailsProps

Ƭ **TransferDetailsProps**: [`TransferDetailsMsgValue`](classes/TransferDetailsMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:46](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L46)

___

### TransferProps

Ƭ **TransferProps**: [`TransferMsgValue`](classes/TransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:43](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L43)

___

### TransparentTransferDataProps

Ƭ **TransparentTransferDataProps**: [`TransparentTransferDataMsgValue`](classes/TransparentTransferDataMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:48](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L48)

___

### TransparentTransferProps

Ƭ **TransparentTransferProps**: [`TransparentTransferMsgValue`](classes/TransparentTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:47](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L47)

___

### TxDetails

Ƭ **TxDetails**: [`WrapperTxProps`](modules.md#wrappertxprops) & \{ `commitments`: [`CommitmentDetailProps`](modules.md#commitmentdetailprops)[] ; `wrapperFeePayer`: `string`  }

#### Defined in

[packages/types/src/tx/types.ts:80](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L80)

___

### TxProps

Ƭ **TxProps**: [`TxMsgValue`](classes/TxMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:49](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L49)

___

### TxResponseProps

Ƭ **TxResponseProps**: [`TxResponseMsgValue`](classes/TxResponseMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:50](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L50)

___

### UnbondProps

Ƭ **UnbondProps**: [`UnbondMsgValue`](classes/UnbondMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:52](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L52)

___

### UnknownVoteType

Ƭ **UnknownVoteType**: ``"unknown"``

#### Defined in

[packages/types/src/proposals.ts:74](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L74)

___

### UnshieldingTransferDataProps

Ƭ **UnshieldingTransferDataProps**: [`UnshieldingTransferDataMsgValue`](classes/UnshieldingTransferDataMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:41](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L41)

___

### UnshieldingTransferProps

Ƭ **UnshieldingTransferProps**: [`UnshieldingTransferMsgValue`](classes/UnshieldingTransferMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:42](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L42)

___

### ValidatorVote

Ƭ **ValidatorVote**: \{ `isValidator`: ``true`` ; `votingPower`: `BigNumber`  } & `VoteCommonProperties`

#### Defined in

[packages/types/src/proposals.ts:86](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L86)

___

### VerifyArbitraryProps

Ƭ **VerifyArbitraryProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `publicKey` | `string` |
| `signature` | `string` |

#### Defined in

[packages/types/src/namada.ts:20](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L20)

___

### Vote

Ƭ **Vote**: [`DelegatorVote`](modules.md#delegatorvote) \| [`ValidatorVote`](modules.md#validatorvote)

#### Defined in

[packages/types/src/proposals.ts:102](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L102)

___

### VoteProposalProps

Ƭ **VoteProposalProps**: [`VoteProposalMsgValue`](classes/VoteProposalMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:53](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L53)

___

### VoteType

Ƭ **VoteType**: typeof [`voteTypes`](modules.md#votetypes)[`number`]

#### Defined in

[packages/types/src/proposals.ts:73](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L73)

___

### Votes

Ƭ **Votes**: `Record`\<[`VoteType`](modules.md#votetype), `BigNumber`\>

#### Defined in

[packages/types/src/proposals.ts:79](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L79)

___

### WindowWithNamada

Ƭ **WindowWithNamada**: `Window` & typeof `globalThis` & \{ `namada`: [`Namada`](interfaces/Namada.md) & \{ `getSigner`: () => [`Signer`](interfaces/Signer.md)  }  }

#### Defined in

[packages/types/src/namada.ts:57](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/namada.ts#L57)

___

### WithdrawProps

Ƭ **WithdrawProps**: [`WithdrawMsgValue`](classes/WithdrawMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:55](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L55)

___

### WrapperTxProps

Ƭ **WrapperTxProps**: [`WrapperTxMsgValue`](classes/WrapperTxMsgValue.md)

#### Defined in

[packages/types/src/tx/types.ts:56](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L56)

___

### Zip32Path

Ƭ **Zip32Path**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `account` | `number` |
| `index?` | `number` |

#### Defined in

[packages/types/src/account.ts:7](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/account.ts#L7)

## Variables

### BigNumberSerializer

• `Const` **BigNumberSerializer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deserialize` | (`reader`: `BinaryReader`) => `BigNumber` |
| `serialize` | (`value`: `BigNumber`, `writer`: `BinaryWriter`) => `void` |

#### Defined in

[packages/types/src/tx/schema/utils.ts:4](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/schema/utils.ts#L4)

___

### CosmosSymbols

• `Const` **CosmosSymbols**: readonly [``"ATOM"``, ``"OSMO"``]

#### Defined in

[packages/types/src/tokens/Cosmos.ts:5](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L5)

___

### CosmosTokens

• `Const` **CosmosTokens**: `Record`\<[`CosmosTokenType`](modules.md#cosmostokentype), [`TokenInfo`](modules.md#tokeninfo)\<[`CosmosMinDenom`](modules.md#cosmosmindenom)\>\>

#### Defined in

[packages/types/src/tokens/Cosmos.ts:22](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L22)

___

### Extensions

• `Const` **Extensions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `keplr` | \{ `alias`: `string` = "Keplr"; `id`: ``"keplr"`` = "keplr"; `url`: `string` = "https://www.keplr.app/" } |
| `keplr.alias` | `string` |
| `keplr.id` | ``"keplr"`` |
| `keplr.url` | `string` |
| `metamask` | \{ `alias`: `string` = "Metamask"; `id`: ``"metamask"`` = "metamask"; `url`: `string` = "https://metamask.io/" } |
| `metamask.alias` | `string` |
| `metamask.id` | ``"metamask"`` |
| `metamask.url` | `string` |
| `namada` | \{ `alias`: `string` = "Namada"; `id`: ``"namada"`` = "namada"; `url`: `string` = "https://namada.me" } |
| `namada.alias` | `string` |
| `namada.id` | ``"namada"`` |
| `namada.url` | `string` |

#### Defined in

[packages/types/src/chain.ts:30](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L30)

___

### NamadaChains

• `Const` **NamadaChains**: `Map`\<`string`, `string`\>

Chain name lookup for mainnet and known long-running testnets

#### Defined in

[packages/types/src/chain.ts:69](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/chain.ts#L69)

___

### ResultCodes

• `Const` **ResultCodes**: `Record`\<[`ResultCode`](enums/ResultCode.md), `string`\>

#### Defined in

[packages/types/src/tx/types.ts:102](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tx/types.ts#L102)

___

### Symbols

• `Const` **Symbols**: readonly [``"NAM"``, ``"BTC"``, ``"DOT"``, ``"ETH"``, ``"SCH"``, ``"APF"``, ``"KAR"``]

#### Defined in

[packages/types/src/tokens/Namada.ts:11](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Namada.ts#L11)

___

### Tokens

• `Const` **Tokens**: `Record`\<[`TokenType`](modules.md#tokentype), [`TokenInfo`](modules.md#tokeninfo)\>

#### Defined in

[packages/types/src/tokens/Namada.ts:23](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Namada.ts#L23)

___

### proposalStatuses

• `Const` **proposalStatuses**: readonly [``"pending"``, ``"ongoing"``, ``"passed"``, ``"rejected"``, ``"executed"``]

#### Defined in

[packages/types/src/proposals.ts:3](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L3)

___

### tallyTypes

• `Const` **tallyTypes**: readonly [``"two-fifths"``, ``"one-half-over-one-third"``, ``"less-one-half-over-one-third-nay"``]

#### Defined in

[packages/types/src/proposals.ts:104](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L104)

___

### voteTypes

• `Const` **voteTypes**: readonly [``"yay"``, ``"nay"``, ``"abstain"``]

#### Defined in

[packages/types/src/proposals.ts:72](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L72)

## Functions

### isDelegatorVote

▸ **isDelegatorVote**(`vote`): vote is DelegatorVote

#### Parameters

| Name | Type |
| :------ | :------ |
| `vote` | [`Vote`](modules.md#vote) |

#### Returns

vote is DelegatorVote

#### Defined in

[packages/types/src/proposals.ts:99](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L99)

___

### isProposalStatus

▸ **isProposalStatus**(`str`): str is "pending" \| "ongoing" \| "passed" \| "rejected" \| "executed"

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

str is "pending" \| "ongoing" \| "passed" \| "rejected" \| "executed"

#### Defined in

[packages/types/src/proposals.ts:13](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L13)

___

### isTallyType

▸ **isTallyType**(`tallyType`): tallyType is "two-fifths" \| "one-half-over-one-third" \| "less-one-half-over-one-third-nay"

#### Parameters

| Name | Type |
| :------ | :------ |
| `tallyType` | `string` |

#### Returns

tallyType is "two-fifths" \| "one-half-over-one-third" \| "less-one-half-over-one-third-nay"

#### Defined in

[packages/types/src/proposals.ts:112](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L112)

___

### isValidatorVote

▸ **isValidatorVote**(`vote`): vote is ValidatorVote

#### Parameters

| Name | Type |
| :------ | :------ |
| `vote` | [`Vote`](modules.md#vote) |

#### Returns

vote is ValidatorVote

#### Defined in

[packages/types/src/proposals.ts:91](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L91)

___

### isVoteType

▸ **isVoteType**(`str`): str is "yay" \| "nay" \| "abstain"

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

str is "yay" \| "nay" \| "abstain"

#### Defined in

[packages/types/src/proposals.ts:76](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/proposals.ts#L76)

___

### minDenomByToken

▸ **minDenomByToken**(`token`): `undefined` \| ``"uatom"`` \| ``"uosmo"``

#### Parameters

| Name | Type |
| :------ | :------ |
| `token` | `string` |

#### Returns

`undefined` \| ``"uatom"`` \| ``"uosmo"``

#### Defined in

[packages/types/src/tokens/Cosmos.ts:66](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L66)

___

### tokenByMinDenom

▸ **tokenByMinDenom**(`minDenom`): `undefined` \| ``"ATOM"`` \| ``"OSMO"``

#### Parameters

| Name | Type |
| :------ | :------ |
| `minDenom` | `string` |

#### Returns

`undefined` \| ``"ATOM"`` \| ``"OSMO"``

#### Defined in

[packages/types/src/tokens/Cosmos.ts:48](https://github.com/anoma/namada-interface/blob/dedbae7e806a646649051a09499b31d03fef0091/packages/types/src/tokens/Cosmos.ts#L48)

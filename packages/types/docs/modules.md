[@namada/types](README.md) / Exports

# @namada/types

## Table of contents

### Enumerations

- [AccountType](enums/AccountType.md)
- [BridgeType](enums/BridgeType.md)
- [Events](enums/Events.md)
- [KeplrEvents](enums/KeplrEvents.md)
- [MetamaskEvents](enums/MetamaskEvents.md)

### Classes

- [BatchTxResultMsgValue](classes/BatchTxResultMsgValue.md)
- [BondMsgValue](classes/BondMsgValue.md)
- [CommitmentMsgValue](classes/CommitmentMsgValue.md)
- [EthBridgeTransferMsgValue](classes/EthBridgeTransferMsgValue.md)
- [IbcTransferMsgValue](classes/IbcTransferMsgValue.md)
- [Message](classes/Message.md)
- [RedelegateMsgValue](classes/RedelegateMsgValue.md)
- [RevealPkMsgValue](classes/RevealPkMsgValue.md)
- [SignatureMsgValue](classes/SignatureMsgValue.md)
- [TransferDataMsgValue](classes/TransferDataMsgValue.md)
- [TransferMsgValue](classes/TransferMsgValue.md)
- [TransparentTransferDataMsgValue](classes/TransparentTransferDataMsgValue.md)
- [TransparentTransferMsgValue](classes/TransparentTransferMsgValue.md)
- [TxDetailsMsgValue](classes/TxDetailsMsgValue.md)
- [TxResponseMsgValue](classes/TxResponseMsgValue.md)
- [UnbondMsgValue](classes/UnbondMsgValue.md)
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
- [CommitmentDetailProps](modules.md#commitmentdetailprops)
- [CosmosMinDenom](modules.md#cosmosmindenom)
- [CosmosTokenType](modules.md#cosmostokentype)
- [Currency](modules.md#currency)
- [Default](modules.md#default)
- [DefaultWithWasm](modules.md#defaultwithwasm)
- [DelegatorVote](modules.md#delegatorvote)
- [DerivedAccount](modules.md#derivedaccount)
- [EthBridgeTransferProps](modules.md#ethbridgetransferprops)
- [ExtensionInfo](modules.md#extensioninfo)
- [ExtensionKey](modules.md#extensionkey)
- [IbcTransferProps](modules.md#ibctransferprops)
- [JsonCompatibleArray](modules.md#jsoncompatiblearray)
- [JsonCompatibleDictionary](modules.md#jsoncompatibledictionary)
- [PgfActions](modules.md#pgfactions)
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
- [SignArbitraryProps](modules.md#signarbitraryprops)
- [SignArbitraryResponse](modules.md#signarbitraryresponse)
- [SignProps](modules.md#signprops)
- [SignatureProps](modules.md#signatureprops)
- [SupportedTxProps](modules.md#supportedtxprops)
- [TallyType](modules.md#tallytype)
- [TokenBalances](modules.md#tokenbalances)
- [TokenInfo](modules.md#tokeninfo)
- [TokenType](modules.md#tokentype)
- [TransferProps](modules.md#transferprops)
- [TransparentTransferDataProps](modules.md#transparenttransferdataprops)
- [TransparentTransferProps](modules.md#transparenttransferprops)
- [TxData](modules.md#txdata)
- [TxDetails](modules.md#txdetails)
- [TxResponseProps](modules.md#txresponseprops)
- [UnbondProps](modules.md#unbondprops)
- [ValidatorVote](modules.md#validatorvote)
- [VerifyArbitraryProps](modules.md#verifyarbitraryprops)
- [Vote](modules.md#vote)
- [VoteProposalProps](modules.md#voteproposalprops)
- [VoteType](modules.md#votetype)
- [Votes](modules.md#votes)
- [WindowWithNamada](modules.md#windowwithnamada)
- [WithdrawProps](modules.md#withdrawprops)
- [WrapperTxProps](modules.md#wrappertxprops)

### Variables

- [BigNumberSerializer](modules.md#bignumberserializer)
- [CosmosSymbols](modules.md#cosmossymbols)
- [CosmosTokens](modules.md#cosmostokens)
- [Extensions](modules.md#extensions)
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

Ƭ **Account**: `Pick`\<[`DerivedAccount`](modules.md#derivedaccount), ``"address"`` \| ``"alias"`` \| ``"type"`` \| ``"publicKey"``\> & \{ `chainId`: `string` ; `chainKey`: [`ChainKey`](modules.md#chainkey) ; `isShielded`: `boolean`  }

#### Defined in

[account.ts:32](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/account.ts#L32)

___

### AddRemove

Ƭ **AddRemove**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `add?` | `string` |
| `remove` | `string`[] |

#### Defined in

[proposals.ts:33](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L33)

___

### BalancesProps

Ƭ **BalancesProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `owner` | `string` |
| `tokens` | `string`[] |

#### Defined in

[namada.ts:23](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/namada.ts#L23)

___

### BatchTxResultProps

Ƭ **BatchTxResultProps**: [`BatchTxResultMsgValue`](classes/BatchTxResultMsgValue.md)

#### Defined in

[tx/types.ts:19](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L19)

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

[account.ts:3](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/account.ts#L3)

___

### BondProps

Ƭ **BondProps**: [`BondMsgValue`](classes/BondMsgValue.md)

#### Defined in

[tx/types.ts:20](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L20)

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

[chain.ts:49](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L49)

___

### ChainKey

Ƭ **ChainKey**: ``"namada"`` \| ``"cosmos"`` \| ``"ethereum"``

#### Defined in

[chain.ts:21](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L21)

___

### CommitmentDetailProps

Ƭ **CommitmentDetailProps**: [`SupportedTxProps`](modules.md#supportedtxprops) & \{ `hash`: `string` ; `memo?`: `string` ; `txType`: `unknown`  }

#### Defined in

[tx/types.ts:46](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L46)

___

### CosmosMinDenom

Ƭ **CosmosMinDenom**: typeof `cosmosMinDenoms`[`number`]

#### Defined in

[tokens/Cosmos.ts:13](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L13)

___

### CosmosTokenType

Ƭ **CosmosTokenType**: typeof [`CosmosSymbols`](modules.md#cosmossymbols)[`number`]

#### Defined in

[tokens/Cosmos.ts:6](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L6)

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

[chain.ts:1](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L1)

___

### Default

Ƭ **Default**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `type` | ``"default"`` |

#### Defined in

[proposals.ts:54](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L54)

___

### DefaultWithWasm

Ƭ **DefaultWithWasm**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `Uint8Array` |
| `type` | ``"default_with_wasm"`` |

#### Defined in

[proposals.ts:55](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L55)

___

### DelegatorVote

Ƭ **DelegatorVote**: \{ `isValidator`: ``false`` ; `votingPower`: [`string`, `BigNumber`][]  } & `VoteCommonProperties`

#### Defined in

[proposals.ts:83](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L83)

___

### DerivedAccount

Ƭ **DerivedAccount**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `alias` | `string` |
| `id` | `string` |
| `owner?` | `string` |
| `parentId?` | `string` |
| `path` | [`Bip44Path`](modules.md#bip44path) |
| `publicKey?` | `string` |
| `type` | [`AccountType`](enums/AccountType.md) |

#### Defined in

[account.ts:21](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/account.ts#L21)

___

### EthBridgeTransferProps

Ƭ **EthBridgeTransferProps**: [`EthBridgeTransferMsgValue`](classes/EthBridgeTransferMsgValue.md)

#### Defined in

[tx/types.ts:21](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L21)

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

[chain.ts:23](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L23)

___

### ExtensionKey

Ƭ **ExtensionKey**: ``"namada"`` \| ``"keplr"`` \| ``"metamask"``

#### Defined in

[chain.ts:18](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L18)

___

### IbcTransferProps

Ƭ **IbcTransferProps**: [`IbcTransferMsgValue`](classes/IbcTransferMsgValue.md)

#### Defined in

[tx/types.ts:22](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L22)

___

### JsonCompatibleArray

Ƭ **JsonCompatibleArray**: (`string` \| `number` \| `boolean`)[]

#### Defined in

[utils.ts:1](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/utils.ts#L1)

___

### JsonCompatibleDictionary

Ƭ **JsonCompatibleDictionary**: `Object`

#### Index signature

▪ [key: `string`]: `string` \| [`JsonCompatibleArray`](modules.md#jsoncompatiblearray)

#### Defined in

[utils.ts:2](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/utils.ts#L2)

___

### PgfActions

Ƭ **PgfActions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `continuous` | \{ `add`: [`PgfTarget`](modules.md#pgftarget)[] ; `remove`: [`PgfTarget`](modules.md#pgftarget)[]  } |
| `continuous.add` | [`PgfTarget`](modules.md#pgftarget)[] |
| `continuous.remove` | [`PgfTarget`](modules.md#pgftarget)[] |
| `retro` | [`PgfTarget`](modules.md#pgftarget)[] |

#### Defined in

[proposals.ts:46](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L46)

___

### PgfPayment

Ƭ **PgfPayment**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | [`PgfActions`](modules.md#pgfactions) |
| `type` | ``"pgf_payment"`` |

#### Defined in

[proposals.ts:57](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L57)

___

### PgfSteward

Ƭ **PgfSteward**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | [`AddRemove`](modules.md#addremove) |
| `type` | ``"pgf_steward"`` |

#### Defined in

[proposals.ts:56](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L56)

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

[proposals.ts:39](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L39)

___

### Proposal

Ƭ **Proposal**: \{ `activationEpoch`: `bigint` ; `author`: `string` ; `content`: \{ `[key: string]`: `string` \| `undefined`;  } ; `currentTime`: `bigint` ; `endEpoch`: `bigint` ; `endTime`: `bigint` ; `id`: `bigint` ; `proposalType`: [`ProposalType`](modules.md#proposaltype) ; `startEpoch`: `bigint` ; `startTime`: `bigint` ; `status`: [`ProposalStatus`](modules.md#proposalstatus) ; `tallyType`: [`TallyType`](modules.md#tallytype) ; `totalVotingPower`: `BigNumber`  } & \{ [VT in VoteType]: BigNumber }

#### Defined in

[proposals.ts:15](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L15)

___

### ProposalStatus

Ƭ **ProposalStatus**: typeof [`proposalStatuses`](modules.md#proposalstatuses)[`number`]

#### Defined in

[proposals.ts:10](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L10)

___

### ProposalType

Ƭ **ProposalType**: [`Default`](modules.md#default) \| [`DefaultWithWasm`](modules.md#defaultwithwasm) \| [`PgfSteward`](modules.md#pgfsteward) \| [`PgfPayment`](modules.md#pgfpayment)

#### Defined in

[proposals.ts:58](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L58)

___

### ProposalTypeString

Ƭ **ProposalTypeString**: [`ProposalType`](modules.md#proposaltype)[``"type"``]

#### Defined in

[proposals.ts:60](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L60)

___

### RedelegateProps

Ƭ **RedelegateProps**: [`RedelegateMsgValue`](classes/RedelegateMsgValue.md)

#### Defined in

[tx/types.ts:23](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L23)

___

### RevealPkProps

Ƭ **RevealPkProps**: [`RevealPkMsgValue`](classes/RevealPkMsgValue.md)

#### Defined in

[tx/types.ts:33](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L33)

___

### Schema

Ƭ **Schema**: [`BatchTxResultMsgValue`](classes/BatchTxResultMsgValue.md) \| [`EthBridgeTransferMsgValue`](classes/EthBridgeTransferMsgValue.md) \| [`IbcTransferMsgValue`](classes/IbcTransferMsgValue.md) \| [`SignatureMsgValue`](classes/SignatureMsgValue.md) \| [`BondMsgValue`](classes/BondMsgValue.md) \| [`UnbondMsgValue`](classes/UnbondMsgValue.md) \| [`VoteProposalMsgValue`](classes/VoteProposalMsgValue.md) \| [`WithdrawMsgValue`](classes/WithdrawMsgValue.md) \| [`TransferMsgValue`](classes/TransferMsgValue.md) \| [`TransferDataMsgValue`](classes/TransferDataMsgValue.md) \| [`TransparentTransferMsgValue`](classes/TransparentTransferMsgValue.md) \| [`TransparentTransferDataMsgValue`](classes/TransparentTransferDataMsgValue.md) \| [`TxResponseMsgValue`](classes/TxResponseMsgValue.md) \| [`WrapperTxMsgValue`](classes/WrapperTxMsgValue.md) \| [`RedelegateMsgValue`](classes/RedelegateMsgValue.md) \| [`CommitmentMsgValue`](classes/CommitmentMsgValue.md) \| [`TxDetailsMsgValue`](classes/TxDetailsMsgValue.md) \| [`RevealPkMsgValue`](classes/RevealPkMsgValue.md)

#### Defined in

[tx/schema/index.ts:37](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/schema/index.ts#L37)

___

### SignArbitraryProps

Ƭ **SignArbitraryProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | `string` |
| `signer` | `string` |

#### Defined in

[namada.ts:5](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/namada.ts#L5)

___

### SignArbitraryResponse

Ƭ **SignArbitraryResponse**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `hash` | `string` |
| `signature` | `string` |

#### Defined in

[signer.ts:3](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/signer.ts#L3)

___

### SignProps

Ƭ **SignProps**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `checksums?` | `Record`\<`string`, `string`\> |
| `signer` | `string` |
| `tx` | [`TxData`](modules.md#txdata) |
| `txs?` | `Uint8Array`[] |

#### Defined in

[namada.ts:10](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/namada.ts#L10)

___

### SignatureProps

Ƭ **SignatureProps**: [`SignatureMsgValue`](classes/SignatureMsgValue.md)

#### Defined in

[tx/types.ts:24](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L24)

___

### SupportedTxProps

Ƭ **SupportedTxProps**: [`BondProps`](modules.md#bondprops) \| [`UnbondProps`](modules.md#unbondprops) \| [`WithdrawProps`](modules.md#withdrawprops) \| [`RedelegateProps`](modules.md#redelegateprops) \| [`EthBridgeTransferProps`](modules.md#ethbridgetransferprops) \| [`IbcTransferProps`](modules.md#ibctransferprops) \| [`VoteProposalProps`](modules.md#voteproposalprops) \| [`TransferProps`](modules.md#transferprops) \| [`RevealPkProps`](modules.md#revealpkprops)

#### Defined in

[tx/types.ts:35](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L35)

___

### TallyType

Ƭ **TallyType**: typeof [`tallyTypes`](modules.md#tallytypes)[`number`]

#### Defined in

[proposals.ts:99](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L99)

___

### TokenBalances

Ƭ **TokenBalances**\<`T`\>: `Partial`\<`Record`\<`T`, `BigNumber`\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` = [`TokenType`](modules.md#tokentype) |

#### Defined in

[tokens/types.ts:19](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/types.ts#L19)

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

[tokens/types.ts:5](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/types.ts#L5)

___

### TokenType

Ƭ **TokenType**: typeof [`Symbols`](modules.md#symbols)[`number`]

#### Defined in

[tokens/Namada.ts:21](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Namada.ts#L21)

___

### TransferProps

Ƭ **TransferProps**: [`TransferMsgValue`](classes/TransferMsgValue.md)

#### Defined in

[tx/types.ts:25](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L25)

___

### TransparentTransferDataProps

Ƭ **TransparentTransferDataProps**: [`TransparentTransferDataMsgValue`](classes/TransparentTransferDataMsgValue.md)

#### Defined in

[tx/types.ts:27](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L27)

___

### TransparentTransferProps

Ƭ **TransparentTransferProps**: [`TransparentTransferMsgValue`](classes/TransparentTransferMsgValue.md)

#### Defined in

[tx/types.ts:26](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L26)

___

### TxData

Ƭ **TxData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `signingDataBytes` | `Uint8Array`[] |
| `txBytes` | `Uint8Array` |

#### Defined in

[signer.ts:8](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/signer.ts#L8)

___

### TxDetails

Ƭ **TxDetails**: [`WrapperTxProps`](modules.md#wrappertxprops) & \{ `commitments`: [`CommitmentDetailProps`](modules.md#commitmentdetailprops)[]  }

#### Defined in

[tx/types.ts:52](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L52)

___

### TxResponseProps

Ƭ **TxResponseProps**: [`TxResponseMsgValue`](classes/TxResponseMsgValue.md)

#### Defined in

[tx/types.ts:28](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L28)

___

### UnbondProps

Ƭ **UnbondProps**: [`UnbondMsgValue`](classes/UnbondMsgValue.md)

#### Defined in

[tx/types.ts:29](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L29)

___

### ValidatorVote

Ƭ **ValidatorVote**: \{ `isValidator`: ``true`` ; `votingPower`: `BigNumber`  } & `VoteCommonProperties`

#### Defined in

[proposals.ts:75](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L75)

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

[namada.ts:17](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/namada.ts#L17)

___

### Vote

Ƭ **Vote**: [`DelegatorVote`](modules.md#delegatorvote) \| [`ValidatorVote`](modules.md#validatorvote)

#### Defined in

[proposals.ts:91](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L91)

___

### VoteProposalProps

Ƭ **VoteProposalProps**: [`VoteProposalMsgValue`](classes/VoteProposalMsgValue.md)

#### Defined in

[tx/types.ts:30](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L30)

___

### VoteType

Ƭ **VoteType**: typeof [`voteTypes`](modules.md#votetypes)[`number`]

#### Defined in

[proposals.ts:63](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L63)

___

### Votes

Ƭ **Votes**: `Record`\<[`VoteType`](modules.md#votetype), `BigNumber`\>

#### Defined in

[proposals.ts:68](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L68)

___

### WindowWithNamada

Ƭ **WindowWithNamada**: `Window` & typeof `globalThis` & \{ `namada`: [`Namada`](interfaces/Namada.md) & \{ `getSigner`: () => [`Signer`](interfaces/Signer.md)  }  }

#### Defined in

[namada.ts:42](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/namada.ts#L42)

___

### WithdrawProps

Ƭ **WithdrawProps**: [`WithdrawMsgValue`](classes/WithdrawMsgValue.md)

#### Defined in

[tx/types.ts:31](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L31)

___

### WrapperTxProps

Ƭ **WrapperTxProps**: [`WrapperTxMsgValue`](classes/WrapperTxMsgValue.md)

#### Defined in

[tx/types.ts:32](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/types.ts#L32)

## Variables

### BigNumberSerializer

• `Const` **BigNumberSerializer**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `deserialize` | (`reader`: `BinaryReader`) => `BigNumber` |
| `serialize` | (`value`: `BigNumber`, `writer`: `BinaryWriter`) => `void` |

#### Defined in

[tx/schema/utils.ts:4](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tx/schema/utils.ts#L4)

___

### CosmosSymbols

• `Const` **CosmosSymbols**: readonly [``"ATOM"``, ``"OSMO"``]

#### Defined in

[tokens/Cosmos.ts:5](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L5)

___

### CosmosTokens

• `Const` **CosmosTokens**: `Record`\<[`CosmosTokenType`](modules.md#cosmostokentype), [`TokenInfo`](modules.md#tokeninfo)\<[`CosmosMinDenom`](modules.md#cosmosmindenom)\>\>

#### Defined in

[tokens/Cosmos.ts:22](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L22)

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

[chain.ts:30](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/chain.ts#L30)

___

### Symbols

• `Const` **Symbols**: readonly [``"NAM"``, ``"BTC"``, ``"DOT"``, ``"ETH"``, ``"SCH"``, ``"APF"``, ``"KAR"``]

#### Defined in

[tokens/Namada.ts:11](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Namada.ts#L11)

___

### Tokens

• `Const` **Tokens**: `Record`\<[`TokenType`](modules.md#tokentype), [`TokenInfo`](modules.md#tokeninfo)\>

#### Defined in

[tokens/Namada.ts:23](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Namada.ts#L23)

___

### proposalStatuses

• `Const` **proposalStatuses**: readonly [``"pending"``, ``"ongoing"``, ``"passed"``, ``"rejected"``]

#### Defined in

[proposals.ts:3](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L3)

___

### tallyTypes

• `Const` **tallyTypes**: readonly [``"two-thirds"``, ``"one-half-over-one-third"``, ``"less-one-half-over-one-third-nay"``]

#### Defined in

[proposals.ts:93](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L93)

___

### voteTypes

• `Const` **voteTypes**: readonly [``"yay"``, ``"nay"``, ``"abstain"``]

#### Defined in

[proposals.ts:62](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L62)

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

[proposals.ts:88](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L88)

___

### isProposalStatus

▸ **isProposalStatus**(`str`): str is "pending" \| "ongoing" \| "passed" \| "rejected"

#### Parameters

| Name | Type |
| :------ | :------ |
| `str` | `string` |

#### Returns

str is "pending" \| "ongoing" \| "passed" \| "rejected"

#### Defined in

[proposals.ts:12](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L12)

___

### isTallyType

▸ **isTallyType**(`tallyType`): tallyType is "two-thirds" \| "one-half-over-one-third" \| "less-one-half-over-one-third-nay"

#### Parameters

| Name | Type |
| :------ | :------ |
| `tallyType` | `string` |

#### Returns

tallyType is "two-thirds" \| "one-half-over-one-third" \| "less-one-half-over-one-third-nay"

#### Defined in

[proposals.ts:101](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L101)

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

[proposals.ts:80](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L80)

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

[proposals.ts:65](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/proposals.ts#L65)

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

[tokens/Cosmos.ts:66](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L66)

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

[tokens/Cosmos.ts:48](https://github.com/anoma/namada-interface/blob/65deeb6f/packages/types/src/tokens/Cosmos.ts#L48)

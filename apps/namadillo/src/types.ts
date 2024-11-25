import { Asset, AssetList, Chain, IBCInfo } from "@chain-registry/types";
import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  ValidatorStatus,
} from "@namada/indexer-client";
import {
  Account,
  ChainKey,
  ClaimRewardsMsgValue,
  ExtensionKey,
} from "@namada/types";
import { MutationStatus } from "@tanstack/query-core";
import BigNumber from "bignumber.js";
import { TxKind } from "types/txKind";

declare module "*.module.css" {
  const content: Record<string, string>;
  //@ts-expect-error Ignoring duplicate name 'class' error
  export default content;
}

// TODO: can we remove this Unique type? We shouldn't be using uuids anywhere
type Unique = {
  uuid: string;
};

export type Address = string;

export type ChainId = string;

export type GasLimit = BigNumber;

export type GasPrice = BigNumber;

export type AddressBalance = Record<Address, BigNumber>;

export type GasConfig = {
  gasLimit: GasLimit;
  gasPrice: GasPrice;
};

export type TxGas = Record<Address, GasLimit>;

export type GasTable = Record<TxKind, TxGas>;

export type ChainSettings = {
  id: ChainKey;
  bench32Prefix: string;
  nativeTokenAddress: Address;
  rpcUrl: string;
  chainId: string;
  extensionId: ExtensionKey;
  checksums: Record<string, string>;
};

export type SettingsTomlOptions = {
  indexer_url?: string;
  masp_indexer_url?: string;
  rpc_url?: string;
};

export type ChainParameters = {
  apr: BigNumber;
  chainId: string;
  nativeTokenAddress: Address;
  unbondingPeriod: string;
  checksums: Record<string, string>;
};

export type SettingsStorage = {
  version: string;
  rpcUrl?: string;
  indexerUrl: string;
  maspIndexerUrl?: string;
  signArbitraryEnabled: boolean;
  enableTestnets?: boolean;
};

export type Validator = Unique & {
  alias?: string;
  address: Address;
  description?: string;
  homepageUrl?: string;
  expectedApr: BigNumber;
  unbondingPeriod: string;
  votingPowerInNAM?: BigNumber;
  votingPowerPercentage?: number;
  commission: BigNumber;
  imageUrl?: string;
  status: ValidatorStatus;
};

export type ValidatorFilterOptions = "all" | "active" | ValidatorStatus;

export type UnbondEntry = Omit<IndexerUnbond, "validator"> & {
  timeLeft?: string;
};

export type BondEntry = Omit<IndexerBond, "validator">;

export type MyValidator = {
  stakedAmount?: BigNumber;
  unbondedAmount?: BigNumber;
  withdrawableAmount?: BigNumber;
  validator: Validator;
  bondItems: BondEntry[];
  unbondItems: UnbondEntry[];
};

export type StakingTotals = {
  totalBonded: BigNumber;
  totalUnbonded: BigNumber;
  totalWithdrawable: BigNumber;
};

export type ChangeInStakingProps = {
  account: Account;
  changes: ChangeInStakingPosition[];
  gasConfig: GasConfig;
};

export type ChangeInStakingPosition = {
  validatorId: Address;
  amount: BigNumber;
};

export type RedelegateChangesProps = {
  account: Account;
  changes: RedelegateChange[];
  gasConfig: GasConfig;
};

export type RedelegateChange = {
  sourceValidator: Address;
  destinationValidator: Address;
  amount: BigNumber;
};

export type ClaimRewardsProps = {
  account: Account;
  params: ClaimRewardsMsgValue[];
  gasConfig: GasConfig;
};

export type BuildTxAtomParams<T> = {
  account: Account;
  params: T[];
  gasConfig: GasConfig;
  memo?: string;
};

export type SortOptions = "asc" | "desc" | undefined;

export type SortedColumnPair<T> = [id: T, SortOptions] | undefined;

export type ToastNotification = {
  id: string;
  type: "pending" | "success" | "partialSuccess" | "error";
  title: React.ReactNode;
  description: React.ReactNode;
  failedDescription?: React.ReactNode;
  details?: React.ReactNode;
  timeout?: number;
};

export type ToastNotificationEntryFilter = (
  notification: ToastNotification
) => boolean;

export type WalletProvider = {
  id: ExtensionKey;
  name: string;
  iconUrl: string;
  downloadUrl: {
    chrome: string;
    firefox: string;
  };
};

export type ChainRegistryEntry = {
  assets: AssetList;
  chain: Chain;
  ibc?: IBCInfo[];
};

export type AddressWithAsset = {
  originalAddress: Address;
  asset: Asset;
};

export type AddressWithAssetAndAmount = AddressWithAsset & {
  amount: BigNumber;
};

export type AddressWithAssetAndAmountMap = Record<
  Address,
  AddressWithAssetAndAmount
>;

export enum TransferStep {
  Sign = "sign",
  ZkProof = "zk-proof",
  TransparentToShielded = "transparent-to-shielded",
  ShieldedToTransparent = "shielded-to-transparent",
  TransparentToTransparent = "transparent-to-transparent",
  ShieldedToShielded = "shielded-to-shielded",
  IbcWithdraw = "ibc-withdraw",
  IbcToShielded = "ibc-to-shielded",
  IbcToTransparent = "ibc-to-transparent",
  Complete = "complete",
}

// Defines the steps in the Namada <> Namada transfer progress for tracking transaction stages.
export const namadaTransferStages = {
  TransparentToShielded: [
    TransferStep.Sign,
    TransferStep.ZkProof,
    TransferStep.TransparentToShielded,
    TransferStep.Complete,
  ] as const,
  ShieldedToTransparent: [
    TransferStep.Sign,
    TransferStep.ShieldedToTransparent,
    TransferStep.Complete,
  ] as const,
  ShieldedToShielded: [
    TransferStep.Sign,
    TransferStep.ShieldedToShielded,
    TransferStep.Complete,
  ] as const,
  TransparentToTransparent: [
    TransferStep.Sign,
    TransferStep.TransparentToTransparent,
    TransferStep.Complete,
  ] as const,
};

// Defines the steps in the IBC <> Namada transfer progress for tracking transaction stages.
export const ibcTransferStages = {
  TransparentToIbc: [
    TransferStep.Sign,
    TransferStep.IbcWithdraw,
    TransferStep.Complete,
  ] as const,
  IbcToShielded: [
    TransferStep.Sign,
    TransferStep.ZkProof,
    TransferStep.IbcToShielded,
    TransferStep.Complete,
  ] as const,
  IbcToTransparent: [
    TransferStep.Sign,
    TransferStep.IbcToTransparent,
    TransferStep.Complete,
  ] as const,
};

export const allTransferStages = {
  ...namadaTransferStages,
  ...ibcTransferStages,
};

export const transferPossibleStages = [
  ...new Set(Object.values(allTransferStages).flat()),
] as const;

export const transparentTransferTypes: Array<keyof AllTransferStages> = [
  "ShieldedToTransparent",
  "TransparentToIbc",
  "TransparentToTransparent",
  "IbcToTransparent",
] as const;

export const ibcTransferTypes: Array<keyof AllTransferStages> = [
  "IbcToTransparent",
  "TransparentToIbc",
  "IbcToShielded",
] as const;

type NamadaTransferStages = typeof namadaTransferStages;
type IbcTransferStages = typeof ibcTransferStages;
export type AllTransferStages = typeof allTransferStages;

export type NamadaTransferTxKind = keyof NamadaTransferStages;

export type IbcTransferTxKind = keyof IbcTransferStages;

export type AllTransferTxKind = NamadaTransferTxKind | IbcTransferTxKind;

export type NamadaTransferStage = {
  [P in NamadaTransferTxKind]: {
    type: P;
    currentStep: TransferStep;
  };
}[NamadaTransferTxKind];

export type IbcTransferStage = {
  [P in IbcTransferTxKind]: {
    type: P;
    currentStep: TransferStep;
  };
}[IbcTransferTxKind];

export type TransferStage = IbcTransferStage | NamadaTransferStage;

export type BaseTransferTransaction = TransferStage & {
  rpc: string;
  asset: Asset;
  hash?: string;
  amount: BigNumber;
  chainId: string;
  sourceAddress: string;
  destinationAddress: string;
  feePaid?: BigNumber;
  tipPaid?: BigNumber;
  resultTxHash?: string;
  errorMessage?: string;
  memo?: string;
  status: MutationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type IbcTransferTransactionData = BaseTransferTransaction & {
  type: IbcTransferTxKind;
  sequence: BigNumber;
  sourceChannel: string;
  destinationChannel?: string;
  sourcePort: string;
  destinationChainId: string;
};

export type TransferTransactionData =
  | BaseTransferTransaction
  | IbcTransferTransactionData;

export type PartialTransferTransactionData = Partial<TransferTransactionData> &
  Pick<TransferTransactionData, "type" | "chainId" | "asset">;

import { Asset, AssetList, Chain, IBCInfo } from "@chain-registry/types";
import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  ValidatorStatus,
} from "@namada/namada-indexer-client";
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
  ibc: IBCInfo[];
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

export const NamadaTransferProgressSteps = {
  TransparentToShielded: [
    "sign",
    "zk-proof",
    "tnam-to-masp",
    "complete",
  ] as const,
  ShieldedToTransparent: ["sign", "masp-to-tnam", "complete"] as const,
  ShieldedToShielded: ["sign", "masp-to-masp", "complete"] as const,
  TransparentToTransparent: ["sign", "tnam-to-tnam", "complete"] as const,
};

export const IbcTransferProgressSteps = {
  TransparentToIbc: ["sign", "ibc-withdraw", "complete"] as const,
  IbcToShielded: ["sign", "zk-proof", "ibc-to-masp", "complete"] as const,
  IbcToTransparent: ["sign", "ibc-to-namada", "complete"] as const,
};

export const TransferProgressSteps = {
  ...NamadaTransferProgressSteps,
  ...IbcTransferProgressSteps,
};

export const TransparentTransferTypes: Array<
  keyof typeof TransferProgressSteps
> = [
  "ShieldedToTransparent",
  "TransparentToIbc",
  "TransparentToTransparent",
  "IbcToTransparent",
];

export const IbcTransferTypes: Array<keyof typeof TransferProgressSteps> = [
  "IbcToTransparent",
  "TransparentToIbc",
  "IbcToShielded",
];

export const TransferProgressStepsEntry = [
  ...new Set(Object.values(TransferProgressSteps).flat()),
] as const;

export type ProgressStepsOptions = (typeof TransferProgressStepsEntry)[number];

export type NamadaTransferTxKind = keyof typeof NamadaTransferProgressSteps;

export type IbcTransferTxKind = keyof typeof IbcTransferProgressSteps;

export type TransferTxKind = NamadaTransferTxKind & IbcTransferTxKind;

export type NamadaTransferProgress = {
  [P in NamadaTransferTxKind]: {
    type: P;
    progressStatus: (typeof NamadaTransferProgressSteps)[P][number];
  };
}[NamadaTransferTxKind];

export type IbcTransferProgress = {
  [P in IbcTransferTxKind]: {
    type: P;
    progressStatus: (typeof IbcTransferProgressSteps)[P][number];
  };
}[IbcTransferTxKind];

export type TransferProgress = IbcTransferProgress | NamadaTransferProgress;

export type TransferTransactionBase = TransferProgress & {
  hash: string;
  rpc: string;
  amount: BigNumber;
  denom: string;
  tokenSymbol: string;
  feePaid: BigNumber;
  tipPaid: BigNumber;
  chainId: string;
  sourceAddress: string;
  destinationAddress: string;
  resultTxHash?: string;
  errorMessage?: string;
  status: MutationStatus;
  timeoutAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type IbcTransferTransactionData = TransferTransactionBase & {
  type: IbcTransferTxKind;
  sequence: BigNumber;
  sourceChannel: string;
  destinationChannel?: string;
  sourcePort: string;
  destinationChainId: string;
};

export type TransferTransactionData =
  | TransferTransactionBase
  | IbcTransferTransactionData;

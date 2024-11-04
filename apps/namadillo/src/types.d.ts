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

export type UnbondEntry = Omit<
  | (IndexerUnbond & {
      timeLeft?: string;
    })
  | "validator"
>;

export type BondEntry = Omit<IndexerBond | "validator">;

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

export type AssetWithBalanceMap = Record<string, AssetWithBalance>;

export const TransferProgressSteps = {
  TransparentToIbc: ["sign", "ibc-withdraw", "result"] as const,
  IbcToShielded: ["sign", "zk-proof", "ibc-to-masp", "result"] as const,
  IbcToTransparent: ["sign", "transfer", "result"] as const,
  TransparentToShielded: [
    "sign",
    "zk-proof",
    "tnam-to-masp",
    "result",
  ] as const,
  ShieldedToTransparent: ["sign", "masp-to-tnam", "result"] as const,
  ShieldedToShielded: ["sign", "masp-to-masp", "result"] as const,
  TransparentToTransparent: ["sign", "tnam-to-tnam", "result"] as const,
};

export type TransferTxKind = keyof typeof TransferProgressSteps;

export type TransferProgress = {
  [P in TransferTxKind]: {
    type: P;
    progressStatus: (typeof TransferProgressSteps)[P][number];
  };
}[TransferTxKind];

export type TransferTransactionData = TransferProgress & {
  hash: string;
  amount: BigNumber;
  sourceChainId: string;
  sourceCurrency: string;
  destinationCurrency: string;
  destinationAddress: string;
  destinationChain: string;
  status: MutationStatus;
  createdAt: Date;
  updatedAt: Date;
};

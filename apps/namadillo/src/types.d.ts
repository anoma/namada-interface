import {
  Bond as IndexerBond,
  Unbond as IndexerUnbond,
  ValidatorStatus,
} from "@anomaorg/namada-indexer-client";
import { ChainKey, ClaimRewardsMsgValue, ExtensionKey } from "@namada/types";
import BigNumber from "bignumber.js";

declare module "*.module.css" {
  const content: Record<string, string>;
  export default content;
}

// TODO: can we remove this Unique type? We shouldn't be using uuids anywhere
type Unique = {
  uuid: string;
};

export type Address = string;

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
  fiat: CurrencyType;
  rpcUrl?: string;
  indexerUrl: string;
  signArbitraryEnabled: boolean;
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
      timeLeft: string;
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

export type TxKind =
  | "Bond"
  | "Unbond"
  | "Redelegate"
  | "Withdraw"
  | "ClaimRewards"
  | "VoteProposal"
  | "RevealPk"
  | "Unknown";

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

export type Provider = {
  name: string;
  iconUrl: string;
  connected: boolean;
};

export type Chain = {
  chainId: string;
  name: string;
  iconUrl: string;
};

export type Asset = {
  chain: Chain;
  name: string;
  iconUrl: string;
  denomination: string;
  minimalDenomination: string;
  decimals: number;
};

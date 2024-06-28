import { ChainKey, ExtensionKey } from "@namada/types";
import BigNumber from "bignumber.js";

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
  unbondingPeriodInDays: bigint;
  extensionId: ExtensionKey;
};

export type SettingsTomlOptions = {
  indexer_url?: string;
  rpc_url?: string;
};

export type ChainParameters = {
  unbondingPeriodInDays: bigint;
  apr: BigNumber;
  chainId: string;
  nativeTokenAddress: Address;
};

export type SettingsStorage = {
  version: string;
  fiat: CurrencyType;
  hideBalances: boolean;
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
};

export type MyValidator = {
  stakingStatus: string;
  stakedAmount?: BigNumber;
  unbondedAmount?: BigNumber;
  withdrawableAmount?: BigNumber;
  validator: Validator;
};

export type MyUnbondingValidator = MyValidator & {
  timeLeft: string;
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

export type TxKind =
  | "Bond"
  | "Unbond"
  | "Redelegation"
  | "Withdraw"
  | "ClaimRewards"
  | "VoteProposal"
  | "Unknown";

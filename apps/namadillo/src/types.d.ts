import { ChainKey, ExtensionKey } from "@namada/types";
import BigNumber from "bignumber.js";

export type Address = string;

export type AddressBalance = Record<Address, BigNumber>;

export type GasConfig = {
  gasLimit: BigNumber;
  gasPrice: BigNumber;
};

export type ChainSettings = {
  id: ChainKey;
  bench32Prefix: string;
  nativeTokenAddress: Address;
  rpcUrl: string;
  chainId: string;
  unbondingPeriodInDays: bigint;
  extensionId: ExtensionKey;
};

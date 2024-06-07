import BigNumber from "bignumber.js";

export type GasConfig = {
  gasLimit: BigNumber;
  gasPrice: BigNumber;
};

export type GasRangeOption = "low" | "average" | "high";

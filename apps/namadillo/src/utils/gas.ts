import BigNumber from "bignumber.js";
import { GasConfig } from "types";
import { toDisplayAmount } from "utils";

export const getBaseGasFee = (gasConfig: GasConfig): BigNumber => {
  return BigNumber(gasConfig.gasPrice).multipliedBy(gasConfig.gasLimit);
};

export const getDisplayGasFee = (gasConfig: GasConfig): BigNumber => {
  const baseFee = getBaseGasFee(gasConfig);
  return gasConfig.asset ? toDisplayAmount(gasConfig.asset, baseFee) : baseFee;
};

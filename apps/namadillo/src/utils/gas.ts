import BigNumber from "bignumber.js";
import { GasConfig } from "types";

export const getDisplayGasFee = (gasConfig: GasConfig): BigNumber => {
  return BigNumber(gasConfig.gasPrice)
    .multipliedBy(gasConfig.gasLimit)
    .decimalPlaces(6);
};

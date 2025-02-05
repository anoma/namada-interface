import BigNumber from "bignumber.js";
import { findAssetByDenom } from "integrations/utils";
import { GasConfig, GasConfigToDisplay } from "types";
import { toDisplayAmount } from "utils";
import { unknownAsset } from "./assets";

export const calculateGasFee = (gasConfig: GasConfig): BigNumber => {
  return BigNumber(gasConfig.gasPrice).multipliedBy(gasConfig.gasLimit);
};

export const getDisplayGasFee = (gasConfig: GasConfig): GasConfigToDisplay => {
  const denom = gasConfig.gasToken;
  const asset = findAssetByDenom(denom);
  const totalDisplayAmount = calculateGasFee(gasConfig);

  if (!asset) {
    return { totalDisplayAmount, asset: unknownAsset(gasConfig.gasToken) };
  }

  return {
    totalDisplayAmount: toDisplayAmount(
      asset,
      totalDisplayAmount
    ).decimalPlaces(6),
    asset,
  };
};

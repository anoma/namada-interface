import { Asset } from "@chain-registry/types";
import { isTransparentAddress } from "App/Transfer/common";
import BigNumber from "bignumber.js";
import { findAssetByDenom } from "integrations/utils";
import { Address, GasConfig, GasConfigToDisplay } from "types";
import { isNamadaAsset, toDisplayAmount } from "utils";
import { unknownAsset } from "./assets";

export const calculateGasFee = (gasConfig: GasConfig): BigNumber => {
  return BigNumber(gasConfig.gasPriceInMinDenom).multipliedBy(
    gasConfig.gasLimit
  );
};

export const getDisplayGasFee = (
  gasConfig: GasConfig,
  chainAssetsMap?: Record<Address, Asset | undefined>
): GasConfigToDisplay => {
  const { gasToken } = gasConfig;
  let asset: Asset;

  if (isTransparentAddress(gasToken) && chainAssetsMap) {
    // The gasConfig token might be the address of the token on Namada chain
    asset = chainAssetsMap[gasToken] ?? unknownAsset(gasToken);
  } else {
    // However, if the gasConfig contains a token used by Keplr, it could be the asset
    // denomination unit, like "uosmo"
    asset = findAssetByDenom(gasToken) ?? unknownAsset(gasToken);
  }

  const totalDisplayAmount = calculateGasFee(gasConfig);
  return {
    totalDisplayAmount:
      isNamadaAsset(asset) ? totalDisplayAmount : (
        toDisplayAmount(asset, totalDisplayAmount).decimalPlaces(6)
      ),
    asset,
  };
};

import { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { TokenBalance } from "./atoms";

/**
 * Find the expoent of a denom (`uatom`, `atom`, etc).
 * Useful to calculate the token amount with correct decimal part
 * @param asset
 * @param denom
 * @returns The expoent, or zero if not found
 */
export const findExpoent = (asset: Asset, denom: string): number =>
  asset.denom_units.find(
    (unit) => unit.denom === denom || unit.aliases?.includes(denom)
  )?.exponent ?? 0;

/**
 * Sum the dollar amount of a list of token
 * @param tokens
 * @returns The total of dollars, or `undefined` if at least one token has `dollar: undefined`
 */
export const sumDollars = (tokens?: TokenBalance[]): BigNumber | undefined => {
  if (!tokens) {
    return undefined;
  }
  let sum = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const { dollar } = tokens[i];
    if (dollar) {
      sum = sum.plus(dollar);
    } else {
      return undefined;
    }
  }
  return sum;
};

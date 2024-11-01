import BigNumber from "bignumber.js";
import { NAM_DENOM, TokenBalance } from "./atoms";

/**
 * Sum the dollar amount of a list of tokens
 * @param tokens
 * @returns The total of dollars, or `undefined` if at least one token has `dollar: undefined`
 */
export const sumDollars = (tokens: TokenBalance[]): BigNumber | undefined => {
  let sum = new BigNumber(0);
  for (let i = 0; i < tokens.length; i++) {
    const { dollar } = tokens[i];
    if (!dollar) {
      return undefined;
    }
    sum = sum.plus(dollar);
  }
  return sum;
};

export const getTotalDollar = (list?: TokenBalance[]): BigNumber | undefined =>
  sumDollars(list?.filter((i) => i.denom !== NAM_DENOM) ?? []);

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => i.denom === NAM_DENOM)?.balance ?? new BigNumber(0);

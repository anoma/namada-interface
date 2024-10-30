import BigNumber from "bignumber.js";
import { TokenBalance } from "./atoms";

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

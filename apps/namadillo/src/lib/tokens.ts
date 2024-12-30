import { Balance, IbcToken, NativeToken } from "@namada/indexer-client";
import BigNumber from "bignumber.js";
import { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";
import { Address, TokenBalance } from "types";
import { isNamadaAsset, namadaAsset, toDisplayAmount } from "utils";

export const getNamTokenAmount = (
  balances: Balance[],
  namTokenAddress: Address
): BigNumber => {
  const balance = balances
    .filter(({ tokenAddress: ta }) => ta === namTokenAddress)
    .map(({ tokenAddress, minDenomAmount }) => {
      return {
        token: tokenAddress,
        amount: toDisplayAmount(namadaAsset(), new BigNumber(minDenomAmount)),
      };
    })
    .at(0);
  return balance ? BigNumber(balance.amount) : BigNumber(0);
};

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
  sumDollars(list ?? []);

export const getTotalNam = (list?: TokenBalance[]): BigNumber =>
  list?.find((i) => isNamadaAsset(i.asset))?.amount ?? new BigNumber(0);

export const tnamAddressToDenomTrace = (
  address: string,
  chainTokens: (NativeToken | IbcToken)[]
): DenomTrace | undefined => {
  const token = chainTokens.find((entry) => entry.address === address);
  const trace = token && "trace" in token ? token.trace : undefined;

  // If no trace, the token is NAM, but return undefined because we only care
  // about IBC tokens here
  if (typeof trace === "undefined") {
    return undefined;
  }

  const separatorIndex = trace.lastIndexOf("/");
  if (separatorIndex === -1) {
    return undefined;
  }

  return {
    path: trace.substring(0, separatorIndex),
    baseDenom: trace.substring(separatorIndex + 1),
  };
};

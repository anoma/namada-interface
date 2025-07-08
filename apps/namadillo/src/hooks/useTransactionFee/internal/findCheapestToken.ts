import BigNumber from "bignumber.js";

import { GasPriceTable } from "atoms/fees";
import { Address } from "types";

export const findCheapestToken = (
  gasPriceTable: GasPriceTable,
  balance: { tokenAddress: Address; minDenomAmount: BigNumber }[],
  gasLimit: BigNumber,
  gasDollarMap: Record<Address, BigNumber>
): string | undefined => {
  let minPriceInDollars: BigNumber | undefined,
    cheapestToken: string | undefined;

  for (const gasItem of gasPriceTable) {
    const price = gasDollarMap[gasItem.token];
    if (!price) continue;

    // Skip tokens that do not have enough balance
    const requiredBalance = BigNumber(gasLimit).times(
      gasItem.gasPriceInMinDenom
    );
    const tokenBalance = balance.find(
      (balance) => balance.tokenAddress === gasItem.token
    );

    if (!tokenBalance || tokenBalance.minDenomAmount.lt(requiredBalance)) {
      continue;
    }

    // This is not real price as we multiply price in dollar by gas price in MIN denom
    // It's ok though as we use it only for comparison
    const gasPriceInDollars = price.multipliedBy(gasItem.gasPriceInMinDenom);
    if (
      typeof minPriceInDollars === "undefined" ||
      gasPriceInDollars.lt(minPriceInDollars)
    ) {
      minPriceInDollars = gasPriceInDollars;
      cheapestToken = gasItem.token;
    }
  }

  return cheapestToken;
};

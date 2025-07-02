import BigNumber from "bignumber.js";

import { GasPriceTable } from "atoms/fees";
import { Address } from "types";

export const findCheapestToken = (
  gasPriceTable: GasPriceTable,
  balance: { tokenAddress: Address; amount: BigNumber }[],
  gasLimit: BigNumber,
  gasDollarMap: Record<Address, BigNumber>
): string | undefined => {
  let minPriceInDollars: BigNumber | undefined,
    cheapestToken: string | undefined;

  for (const gasItem of gasPriceTable) {
    const price = gasDollarMap[gasItem.token];
    if (!price) continue;

    // Skip tokens that do not have enough balance
    const requiredBalance = BigNumber(gasLimit).times(gasItem.gasPrice);
    const tokenBalance = balance.find(
      (balance) => balance.tokenAddress === gasItem.token
    );
    if (!tokenBalance || tokenBalance.amount.lt(requiredBalance)) {
      continue;
    }

    const gasPriceInDollars = price.multipliedBy(gasItem.gasPrice);
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

import BigNumber from "bignumber.js";
import { RedelegateChange } from "types/staking";

export const getReducedAmounts = (
  stakedAmounts: Record<string, BigNumber>,
  updatedAmounts: Record<string, BigNumber>
): Record<string, BigNumber> => {
  const reducedAmounts: Record<string, BigNumber> = {};
  for (const address in updatedAmounts) {
    if (!stakedAmounts.hasOwnProperty(address)) continue;
    if (stakedAmounts[address].gt(updatedAmounts[address])) {
      reducedAmounts[address] = stakedAmounts[address].minus(
        updatedAmounts[address]
      );
    }
  }
  return reducedAmounts;
};

export const getIncrementedAmounts = (
  stakedAmounts: Record<string, BigNumber>,
  updatedAmounts: Record<string, BigNumber>
): Record<string, BigNumber> => {
  const incrementedAmounts: Record<string, BigNumber> = {};
  for (const address in updatedAmounts) {
    if (
      !stakedAmounts[address] ||
      updatedAmounts[address].gt(stakedAmounts[address])
    ) {
      incrementedAmounts[address] = updatedAmounts[address].minus(
        stakedAmounts[address] || 0
      );
    }
  }
  return incrementedAmounts;
};

export const getPendingToDistributeAmount = (
  stakedAmounts: Record<string, BigNumber>,
  updatedAmounts: Record<string, BigNumber>
): BigNumber => {
  const incrementedAmounts = Object.values(
    getIncrementedAmounts(stakedAmounts, updatedAmounts)
  );
  const decreasedAmounts = Object.values(
    getReducedAmounts(stakedAmounts, updatedAmounts)
  );

  const incrementedTotal =
    incrementedAmounts.length ?
      BigNumber.sum(...incrementedAmounts)
    : BigNumber(0);

  const decreasedTotal =
    decreasedAmounts.length ? BigNumber.sum(...decreasedAmounts) : BigNumber(0);

  return decreasedTotal.minus(incrementedTotal);
};

export const buildRedelegateChange = (
  sourceValidator: string,
  destinationValidator: string,
  amount: BigNumber
): RedelegateChange => ({ sourceValidator, destinationValidator, amount });

export const getAmountDistribution = (
  reducedAmounts: Record<string, BigNumber>,
  increasedAmounts: Record<string, BigNumber>
): RedelegateChange[] => {
  const redelegateChanges: RedelegateChange[] = [];
  const addressesToReduce = Object.keys(reducedAmounts).sort(
    (address1: string, address2: string) =>
      reducedAmounts[address1].gt(reducedAmounts[address2]) ? 1 : -1
  );

  const addressesToIncrement = Object.keys(increasedAmounts).sort(
    (address1: string, address2: string) =>
      increasedAmounts[address1].gt(increasedAmounts[address2]) ? 1 : -1
  );

  for (const addressToReduce of addressesToReduce) {
    let totalToReduce = reducedAmounts[addressToReduce];
    let shift = false;

    for (const addressToIncrement of addressesToIncrement) {
      const increment = increasedAmounts[addressToIncrement];
      const redelegate = buildRedelegateChange.bind(
        null,
        addressToReduce,
        addressToIncrement
      );

      // redelegating a partial of the current source address to another
      if (totalToReduce.gt(increment)) {
        totalToReduce = totalToReduce.minus(increment);
        redelegateChanges.push(redelegate(increment));
        shift = true;
        continue;
      }

      // we're just decreasing the same amount left
      if (totalToReduce.eq(increment)) {
        redelegateChanges.push(redelegate(increment));
        shift = true;
        break;
      }

      // redelegating all we have from the current source address, but we need more.
      redelegateChanges.push(redelegate(totalToReduce));
      increasedAmounts[addressToIncrement] =
        increasedAmounts[addressToIncrement].minus(totalToReduce);
      break;
    }

    if (shift) {
      addressesToIncrement.shift();
    }
  }

  return redelegateChanges;
};

export const getRedelegateChanges = (
  stakedAmounts: Record<string, BigNumber>,
  updatedAmounts: Record<string, BigNumber>
): RedelegateChange[] => {
  const reducedAmounts = getReducedAmounts(stakedAmounts, updatedAmounts);
  const incrementedAmounts = getIncrementedAmounts(
    stakedAmounts,
    updatedAmounts
  );
  return getAmountDistribution(reducedAmounts, incrementedAmounts);
};

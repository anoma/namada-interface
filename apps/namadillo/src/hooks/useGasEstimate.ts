import { minimumGasPriceAtom } from "atoms/fees";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

type useGasEstimateReturn = {
  gasPrice: BigNumber | undefined;
  calculateMinGasRequired: (
    numberOfTransactions?: number,
    pkRevealNeeded?: number
  ) => BigNumber | undefined;
};

export const useGasEstimate = (): useGasEstimateReturn => {
  const gas = useAtomValue(minimumGasPriceAtom);
  return {
    gasPrice: gas.data,
    calculateMinGasRequired: (
      numberOfTransactions: number = 1,
      pkRevealNeeded: number = numberOfTransactions
    ): BigNumber | undefined => {
      if (!gas.isSuccess) return undefined;
      return gas.data.multipliedBy(numberOfTransactions + pkRevealNeeded);
    },
  };
};

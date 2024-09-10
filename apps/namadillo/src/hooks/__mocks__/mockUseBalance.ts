import BigNumber from "bignumber.js";
import { useBalancesOutput } from "hooks/useBalances";

export const useBalanceOutputMock = {
  balanceQuery: { isError: false },
  stakeQuery: { isError: false },
  isLoading: false,
  isSuccess: true,
  availableAmount: new BigNumber(100),
  bondedAmount: new BigNumber(50),
  unbondedAmount: new BigNumber(30),
  withdrawableAmount: new BigNumber(20),
  totalAmount: new BigNumber(200),
};

export const mockUseBalances = (
  props: Partial<useBalancesOutput> = {}
): void => {
  const useBalances = jest.spyOn(require("hooks/useBalances"), "useBalances");
  useBalances.mockReturnValue({ ...useBalanceOutputMock, ...props });
};

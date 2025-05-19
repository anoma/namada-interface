import { TotalStakeBanner } from "App/AccountOverview/TotalStakeBanner";
import { useBalances } from "hooks/useBalances";

export const StakingSummary = (): JSX.Element => {
  const {
    balanceQuery,
    stakeQuery,
    isLoading,
    isSuccess,
    availableAmount,
    bondedAmount,
    unbondedAmount,
    withdrawableAmount,
    totalTransparentAmount: totalAmount,
  } = useBalances();

  return <TotalStakeBanner />;
};

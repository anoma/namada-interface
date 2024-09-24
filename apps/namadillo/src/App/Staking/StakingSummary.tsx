import {
  ActionButton,
  AmountSummaryCard,
  Image,
  Panel,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { BalanceChart } from "App/Common/BalanceChart";
import { NamCurrency } from "App/Common/NamCurrency";
import { useBalances } from "hooks/useBalances";
import StakingRoutes from "./routes";
import { StakingRewardsPanel } from "./StakingRewardsPanel";

export const StakingSummary = (): JSX.Element => {
  const {
    balanceQuery,
    stakeQuery,
    isLoading,
    isSuccess,
    availableAmount,
    bondedAmount,
    shieldedAmount,
    unbondedAmount,
    withdrawableAmount,
    totalAmount,
  } = useBalances();

  return (
    <ul className="flex flex-col sm:grid sm:grid-cols-[1.25fr_1fr_1fr] gap-2">
      <Panel as="li" className="flex items-center">
        <AtomErrorBoundary
          result={[balanceQuery, stakeQuery]}
          niceError="Unable to load balance"
        >
          <BalanceChart
            view="stake"
            isLoading={isLoading}
            isSuccess={isSuccess}
            availableAmount={availableAmount}
            bondedAmount={bondedAmount}
            shieldedAmount={shieldedAmount}
            unbondedAmount={unbondedAmount}
            withdrawableAmount={withdrawableAmount}
            totalAmount={totalAmount}
          />
        </AtomErrorBoundary>
      </Panel>
      <Panel as="li">
        <AtomErrorBoundary
          result={balanceQuery}
          niceError="Unable to load available NAM balance"
        >
          <AmountSummaryCard
            logoElement={<Image imageName="LogoMinimal" />}
            title={
              <>
                Available NAM
                <br />
                to Stake
              </>
            }
            isLoading={isLoading}
            mainAmount={
              <NamCurrency
                amount={availableAmount ?? 0}
                className="block leading-none"
                currencySignClassName="block mb-3 mt-0.5 text-sm"
              />
            }
            callToAction={
              <ActionButton
                className="px-8"
                size="xs"
                backgroundColor="cyan"
                href={StakingRoutes.incrementBonding().url}
              >
                Stake
              </ActionButton>
            }
          />
        </AtomErrorBoundary>
      </Panel>
      <Panel as="li" className="">
        <StakingRewardsPanel />
      </Panel>
    </ul>
  );
};

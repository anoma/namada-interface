import {
  ActionButton,
  AmountSummaryCard,
  Image,
  Panel,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { BalanceChart } from "App/Common/BalanceChart";
import { NamCurrency } from "App/Common/NamCurrency";
import { routes } from "App/routes";
import { useBalances } from "hooks/useBalances";
import { StakingRewardsPanel } from "./StakingRewardsPanel";

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

  return (
    <ul className="grid sm:grid-cols-[1.25fr_1fr_1fr] gap-2">
      <Panel as="li" className="flex items-center justify-center h-full w-full">
        <AtomErrorBoundary
          result={[balanceQuery, stakeQuery]}
          niceError="Unable to load balance"
        >
          <BalanceChart
            isLoading={isLoading}
            availableAmount={availableAmount}
            bondedAmount={bondedAmount}
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
            isSuccess={isSuccess}
            mainAmount={
              <NamCurrency
                amount={availableAmount ?? 0}
                className="block leading-none"
                currencySymbolClassName="block mb-3 mt-0.5 text-sm"
                decimalPlaces={2}
              />
            }
            callToAction={
              <ActionButton
                className="px-8"
                size="xs"
                outlineColor="cyan"
                backgroundColor="cyan"
                backgroundHoverColor="transparent"
                textColor="black"
                textHoverColor="cyan"
                href={routes.stakingBondingIncrement}
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

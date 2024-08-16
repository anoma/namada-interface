import {
  ActionButton,
  AmountSummaryCard,
  Heading,
  Image,
  Panel,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { accountBalanceAtom } from "atoms/accounts";
import { getStakingTotalAtom } from "atoms/staking";
import { useAtomValue } from "jotai";
import { GoStack } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import StakingRoutes from "./routes";

export const StakingSummary = (): JSX.Element => {
  const navigate = useNavigate();
  const totalStakedBalance = useAtomValue(getStakingTotalAtom);
  const totalAccountBalance = useAtomValue(accountBalanceAtom);
  const {
    data: balance,
    isSuccess: isBalanceLoaded,
    isLoading: isFetchingBalance,
  } = totalAccountBalance;

  const getPiechartData = (): Array<PieChartData> => {
    if (!totalStakedBalance.isSuccess || !isBalanceLoaded) {
      return [];
    }

    const totalStaked = totalStakedBalance.data;
    if (totalStaked.totalUnbonded.eq(0) && totalStaked.totalBonded.eq(0)) {
      return [{ value: 1, color: "#2F2F2F" }];
    }

    return [
      { value: balance, color: "#ffffff" },
      { value: totalStaked.totalBonded, color: "#00ffff" },
      { value: totalStaked.totalUnbonded, color: "#DD1599" },
    ];
  };

  // TODO: implement total staking rewards
  return (
    <ul className="flex flex-col sm:grid sm:grid-cols-[1.25fr_1fr_1fr] gap-2">
      <Panel as="li" className="flex items-center">
        {totalStakedBalance.isPending && (
          <SkeletonLoading
            height="auto"
            width="80%"
            className="rounded-full aspect-square mx-auto border-neutral-800 border-[22px] bg-transparent"
          />
        )}
        <AtomErrorBoundary
          result={totalStakedBalance}
          niceError="Unable to load staked balance"
        >
          {totalStakedBalance.isSuccess && (
            <PieChart
              id="total-staked-balance"
              className="xl:max-w-[85%] mx-auto"
              data={getPiechartData()}
              strokeWidth={7}
              segmentMargin={0}
            >
              <div className="flex flex-col gap-1 leading-tight">
                <Heading className="text-sm text-neutral-500" level="h3">
                  Total Staked Balance
                </Heading>
                <NamCurrency
                  amount={totalStakedBalance.data.totalBonded}
                  className="text-2xl"
                  currencySignClassName="block mb-1 text-xs ml-1"
                />
              </div>
            </PieChart>
          )}
        </AtomErrorBoundary>
      </Panel>
      <Panel as="li">
        <AtomErrorBoundary
          result={totalAccountBalance}
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
            isLoading={totalStakedBalance.isPending || isFetchingBalance}
            mainAmount={
              <NamCurrency
                amount={balance ?? 0}
                className="block leading-none"
                currencySignClassName="block mb-3 mt-0.5 text-sm"
              />
            }
            callToAction={
              <ActionButton
                className="px-8"
                size="xs"
                backgroundColor="cyan"
                onClick={() => navigate(StakingRoutes.incrementBonding().url)}
              >
                Stake
              </ActionButton>
            }
          />
        </AtomErrorBoundary>
      </Panel>
      <Panel as="li" className="opacity-60 pointer-events-none select-none">
        <AmountSummaryCard
          logoElement={
            <i className="text-4xl">
              <GoStack />
            </i>
          }
          title="Staking Rewards will be enabled in phase 2"
          mainAmount={
            <NamCurrency
              amount={0}
              className="block leading-none"
              currencySignClassName="block mb-3 mt-0.5 text-sm"
            />
          }
          callToAction={
            <ActionButton
              className="px-8"
              size="xs"
              backgroundColor="white"
              disabled
            >
              Claim
            </ActionButton>
          }
        />
      </Panel>
    </ul>
  );
};

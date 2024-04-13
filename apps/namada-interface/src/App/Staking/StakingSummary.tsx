import {
  ActionButton,
  AmountSummaryCard,
  Currency,
  Heading,
  Image,
  Panel,
  PieChart,
  PieChartData,
} from "@namada/components";
import { useAtomValue } from "jotai";
import { totalNamBalanceAtom } from "slices/accounts";
import { selectedCurrencyRateAtom } from "slices/exchangeRates";
import { selectedCurrencyAtom } from "slices/settings";
import { getStakingTotalAtom } from "slices/staking";

export const StakingSummary = (): JSX.Element => {
  const totalStakedBalance = useAtomValue(getStakingTotalAtom);
  const selectedCurrency = useAtomValue(selectedCurrencyAtom);
  const selectedCurrencyRate = useAtomValue(selectedCurrencyRateAtom);
  const availableBalance = useAtomValue(totalNamBalanceAtom);

  const getPiechartData = (): Array<PieChartData> => {
    if (totalStakedBalance.totalBonded.eq(0)) {
      return [{ value: 1, color: "#2f2f2f" }];
    }

    return [
      { value: totalStakedBalance.totalBonded, color: "#ffff00" },
      { value: totalStakedBalance.totalUnbonded, color: "#ffffff" },
    ];
  };

  // TODO: implement total staking rewards
  return (
    <ul className="grid grid-cols-[1.25fr_1fr_1fr] gap-2">
      <Panel as="li" className="flex items-center">
        <PieChart
          id="total-staked-balance"
          className="max-w-[85%] mx-auto"
          data={getPiechartData()}
          strokeWidth={7}
        >
          <div className="flex flex-col leading-tight">
            <Heading level="h3">Total Staked Balance</Heading>
            <Currency
              amount={totalStakedBalance.totalBonded}
              spaceAroundSign={true}
              currencyPosition="right"
              currency="nam"
              className="text-2xl"
              currencySignClassName="text-xs ml-1"
            />
            <Currency
              amount={totalStakedBalance.totalBonded.multipliedBy(
                selectedCurrencyRate
              )}
              className="text-neutral-500 text-sm"
              currency={selectedCurrency}
            />
          </div>
        </PieChart>
      </Panel>
      <Panel as="li" className="border border-yellow">
        <AmountSummaryCard
          logoElement={<Image imageName="LogoMinimal" />}
          title="Available NAM to Stake"
          mainAmount={
            <Currency
              amount={availableBalance}
              className="block leading-none"
              currency="nam"
              spaceAroundSign={true}
              currencyPosition="right"
            />
          }
          alternativeAmount={
            <Currency
              amount={totalStakedBalance.totalUnbonded.multipliedBy(
                selectedCurrencyRate
              )}
              currency={selectedCurrency}
            />
          }
          callToAction={
            <ActionButton
              className="px-8"
              borderRadius="sm"
              size="xs"
              color="primary"
            >
              Stake
            </ActionButton>
          }
        />
      </Panel>
      <Panel as="li">
        <AmountSummaryCard
          logoElement={<Image imageName="LogoMinimal" />}
          title="Unclaimed Staking rewards"
          mainAmount="0 NAM"
          alternativeAmount="$0"
          callToAction={
            <ActionButton
              className="px-8"
              borderRadius="sm"
              size="xs"
              color="primary"
            >
              Claim
            </ActionButton>
          }
        />
      </Panel>
    </ul>
  );
};

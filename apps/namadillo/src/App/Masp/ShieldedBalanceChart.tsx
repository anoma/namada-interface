import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import {
  shieldedBalanceWithFiatAtom,
  TokenBalanceWithFiat,
} from "atoms/masp/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { colors } from "theme";

const sumDollar = (array?: TokenBalanceWithFiat[]): BigNumber | undefined => {
  if (!array) {
    return undefined;
  }
  let sum = new BigNumber(0);
  for (let i = 0; i < array.length; i++) {
    const { dollar } = array[i];
    if (dollar) {
      sum = sum.plus(dollar);
    } else {
      return undefined;
    }
  }
  return sum;
};

export const ShieldedBalanceChart = (): JSX.Element => {
  const shieldedBalanceWithFiatQuery = useAtomValue(
    shieldedBalanceWithFiatAtom
  );

  const dollarAmount = sumDollar(shieldedBalanceWithFiatQuery.data);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedBalanceWithFiatQuery}
          niceError="Unable to load balance"
        >
          {shieldedBalanceWithFiatQuery.isLoading ?
            <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          : <PieChart
              id="balance-chart"
              data={[{ value: 100, color: colors.shielded }]}
              strokeWidth={24}
              radius={125}
              segmentMargin={0}
            >
              <div className="flex flex-col gap-1 items-center leading-tight max-w-[180px]">
                {dollarAmount === undefined ?
                  <div>Dollar amount is not available</div>
                : <>
                    <Heading className="text-sm" level="h3">
                      Shielded Balance
                    </Heading>
                    <FiatCurrency
                      className="text-2xl sm:text-3xl"
                      amount={dollarAmount}
                    />
                  </>
                }
              </div>
            </PieChart>
          }
        </AtomErrorBoundary>
      </div>
    </div>
  );
};

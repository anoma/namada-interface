import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { NamCurrency } from "App/Common/NamCurrency";
import { shieldedTokensAtom, transparentTokensAtom } from "atoms/balance";
import { getTotalDollar } from "atoms/balance/functions";
import { applicationFeaturesAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { colors } from "theme";

const BalanceOverviewCaptionItem = ({
  color,
  children,
}: { color: string } & React.PropsWithChildren): JSX.Element => {
  return (
    <li className="flex gap-2 items-center text-base">
      <i
        className="w-3 h-3 aspect-square rounded-full"
        style={{ background: color }}
      />
      {children}
    </li>
  );
};

export const BalanceOverviewChart = (): JSX.Element => {
  const { maspEnabled, namTransfersEnabled } = useAtomValue(
    applicationFeaturesAtom
  );
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);
  const { totalTransparentAmount, isLoading: isLoadingTransparent } =
    useBalances();
  const shieldedDollars =
    getTotalDollar(shieldedTokensQuery.data) || new BigNumber(0);
  const transparentDollars =
    getTotalDollar(transparentTokensQuery.data) || new BigNumber(0);
  const totalAmountInDollars = shieldedDollars.plus(transparentDollars);

  const isLoading =
    maspEnabled ?
      isLoadingTransparent ||
      shieldedTokensQuery.isLoading ||
      transparentTokensQuery.isLoading
    : isLoadingTransparent;

  const getPiechartData = (): Array<PieChartData> => {
    if (isLoading) {
      return [];
    }

    if (!maspEnabled) {
      return [
        {
          value: 1,
          color: totalTransparentAmount.gt(0) ? colors.shielded : colors.empty,
        },
      ];
    }

    if (totalAmountInDollars.eq(0)) {
      return [{ value: 1, color: colors.empty }];
    }

    return [
      {
        value: transparentDollars || new BigNumber(0),
        color: colors.balance,
      },
      { value: shieldedDollars || new BigNumber(0), color: colors.shielded },
    ];
  };

  return (
    <>
      <Heading className="text-sm mb-4" level="h3">
        {maspEnabled ? "Total Non Native Value" : "NAM Balance"}
      </Heading>
      <div className="flex flex-col items-center justify-center">
        <div className="h-[230px] w-[230px]">
          {isLoading ?
            <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          : <PieChart
              id="balance-chart"
              data={getPiechartData()}
              strokeWidth={24}
              radius={125}
              segmentMargin={0}
            >
              <div className="flex flex-col gap-1 leading-tight">
                <div className="text-2xl">
                  {maspEnabled ?
                    <span>
                      <FiatCurrency amount={totalAmountInDollars} />
                      {!namTransfersEnabled && "*"}
                    </span>
                  : <NamCurrency
                      amount={totalTransparentAmount}
                      currencySymbolClassName="hidden"
                      decimalPlaces={2}
                    />
                  }
                </div>
              </div>
            </PieChart>
          }
        </div>
        {maspEnabled && (
          <>
            <ul className="mx-auto px-5 mt-3">
              <BalanceOverviewCaptionItem color={colors.shielded}>
                Shielded Assets
              </BalanceOverviewCaptionItem>
              <BalanceOverviewCaptionItem color={colors.balance}>
                Transparent Assets
              </BalanceOverviewCaptionItem>
            </ul>
            {!namTransfersEnabled && (
              <small className="text-xxs -mb-3 mt-3 block">
                * Balances exclude NAM until phase 5
              </small>
            )}
          </>
        )}
      </div>
    </>
  );
};

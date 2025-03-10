import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { OpacitySlides } from "App/Common/OpacitySlides";
import { shieldedTokensAtom, transparentTokensAtom } from "atoms/balance";
import { getTotalDollar } from "atoms/balance/functions";
import { applicationFeaturesAtom } from "atoms/settings";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { useState } from "react";
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
  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);
  const transparentDollars = getTotalDollar(transparentTokensQuery.data);
  const totalAmountInDollars = shieldedDollars.plus(transparentDollars);

  const [activeIndex, setActiveIndex] = useState<number>(0);

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
        label: "Transparent Assets",
        value: transparentDollars,
        color: colors.balance,
      },
      {
        label: "Shielded Assets",
        value: shieldedDollars,
        color: colors.shielded,
      },
    ];
  };

  const data = getPiechartData();

  return (
    <>
      {!maspEnabled && (
        <Heading className="text-sm mb-4" level="h3">
          NAM Balance
        </Heading>
      )}
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
              data={data}
              strokeWidth={24}
              radius={125}
              segmentMargin={0}
              onMouseLeave={() => setActiveIndex(0)}
              onMouseEnter={(_data: PieChartData, index: number) =>
                setActiveIndex(index + 1)
              }
            >
              <OpacitySlides activeIndex={activeIndex}>
                {[
                  {
                    label: "Total Non Native Value",
                    value: totalAmountInDollars,
                  },
                  ...data,
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 leading-tight text-2xl"
                  >
                    <Heading className="text-sm text-neutral-500" level="h3">
                      {item.label}
                    </Heading>
                    <div>
                      <FiatCurrency amount={item.value} />
                      {!namTransfersEnabled && "*"}
                    </div>
                  </div>
                ))}
              </OpacitySlides>
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
                * Values exclude NAM until phase 5
              </small>
            )}
          </>
        )}
      </div>
    </>
  );
};

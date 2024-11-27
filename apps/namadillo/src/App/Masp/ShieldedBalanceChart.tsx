import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { ProgressBarNames, SdkEvents } from "@namada/sdk/web";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { shieldedSyncAtom, shieldedTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { colors } from "theme";
import {
  ProgressBarFinished,
  ProgressBarIncremented,
} from "workers/ShieldedSyncWorker";

export const ShieldedBalanceChart = (): JSX.Element => {
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const [{ data: shieldedSyncProgress, refetch: shieledSync }] =
    useAtom(shieldedSyncAtom);

  const [progress, setProgress] = useState({
    [ProgressBarNames.Scanned]: 0,
    [ProgressBarNames.Fetched]: 0,
    [ProgressBarNames.Applied]: 0,
  });

  useEffect(() => {
    if (!shieldedSyncProgress) return;

    const onProgressBarIncremented = ({
      name,
      current,
      total,
    }: ProgressBarIncremented): void => {
      const perc =
        total === 0 ? 0 : Math.min(Math.floor((current / total) * 100), 100);

      setProgress((prev) => ({
        ...prev,
        [name]: perc,
      }));
    };

    const onProgressBarFinished = ({ name }: ProgressBarFinished): void => {
      setProgress((prev) => ({
        ...prev,
        [name]: 100,
      }));
    };

    shieldedSyncProgress.on(
      SdkEvents.ProgressBarIncremented,
      onProgressBarIncremented
    );

    shieldedSyncProgress.on(
      SdkEvents.ProgressBarFinished,
      onProgressBarFinished
    );

    return () => {
      shieldedSyncProgress.off(
        SdkEvents.ProgressBarIncremented,
        onProgressBarIncremented
      );
      shieldedSyncProgress.off(
        SdkEvents.ProgressBarFinished,
        onProgressBarFinished
      );
    };
  }, [shieldedSyncProgress]);

  useEffect(() => {
    shieledSync();
  }, []);

  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedTokensQuery}
          niceError="Unable to load balance"
        >
          {shieldedTokensQuery.isPending ?
            <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          : <>
              <PieChart
                id="balance-chart"
                data={[{ value: 100, color: colors.shielded }]}
                strokeWidth={24}
                radius={125}
                segmentMargin={0}
              >
                <div className="flex flex-col gap-1 items-center leading-tight max-w-[180px]">
                  {!shieldedDollars ?
                    "N/A"
                  : <>
                      <Heading className="text-sm" level="h3">
                        Shielded Balance
                      </Heading>
                      <FiatCurrency
                        className="text-2xl sm:text-3xl whitespace-nowrap after:content-['*']"
                        amount={shieldedDollars}
                      />
                    </>
                  }
                </div>
              </PieChart>
              <div className="absolute -bottom-4 -left-2 text-[10px]">
                *Balances exclude NAM until phase 5{" "}
              </div>
            </>
          }
          <div className="absolute top-0 right-0 text-right">
            Shieled sync progress: <br />
            Scanned: {progress[ProgressBarNames.Scanned]}% <br />
            Fetched: {progress[ProgressBarNames.Fetched]}% <br />
            Applied: {progress[ProgressBarNames.Applied]}%
          </div>
        </AtomErrorBoundary>
      </div>
    </div>
  );
};

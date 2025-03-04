import { SkeletonLoading, Stack, Tooltip } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import {
  cachedShieldedRewardsAtom,
  shieldedBalanceAtom,
  shieldedTokensAtom,
} from "atoms/balance/atoms";
import { getTotalNam } from "atoms/balance/functions";
import { applicationFeaturesAtom } from "atoms/settings/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";
import { twMerge } from "tailwind-merge";
import namBalanceIcon from "./assets/nam-balance-icon.png";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

const AsyncNamCurrency = ({
  amount,
  syncing,
  className = "",
}: {
  amount?: BigNumber;
  syncing?: boolean;
  className?: string;
}): JSX.Element => {
  if (amount === undefined) {
    return (
      <Stack gap={1.5} className="items-center">
        <SkeletonLoading height="24px" width="100px" />
        <SkeletonLoading height="18px" width="50px" />
      </Stack>
    );
  }

  return (
    <NamCurrency
      amount={amount}
      className={twMerge(
        "block text-center text-3xl leading-none",
        syncing && "animate-pulse",
        className
      )}
      currencySymbolClassName="block text-xs mt-1"
    />
  );
};

export const ShieldedNamBalance = (): JSX.Element => {
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const { shieldingRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const shieldedRewards = useAtomValue(cachedShieldedRewardsAtom);

  const shieldedNam =
    shieldedTokensQuery.isPending ? undefined : (
      getTotalNam(shieldedTokensQuery.data)
    );

  return (
    <AtomErrorBoundary
      result={shieldedTokensQuery}
      niceError="Unable to load shielded NAM balance"
    >
      <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr] gap-2 min-h-full text-yellow">
        <div
          className={twMerge("relative", "flex flex-col gap-4 justify-between")}
        >
          <div className="absolute -top-3 -left-2 group/tooltip">
            <GoInfo />
            <Tooltip className="w-[360px] z-40">
              Shielded rewards accrue each epoch and are added to your NAM
              shielded balance automatically based on the amount of assets you
              have shielded
            </Tooltip>
          </div>
          <div className="flex flex-col items-center gap-1 text-sm text-center font-medium">
            <div className="relative mt-6">
              <img src={namBalanceIcon} />
              <img
                src={namadaShieldedSvg}
                className="absolute top-[20%] left-[20%] w-[60%] h-[60%]"
              />
            </div>
          </div>
          <AsyncNamCurrency amount={shieldedNam} syncing={isShieldSyncing} />
          <div
            className={twMerge(
              "py-2 max-w-[160px] mx-auto mt-4 mb-3",
              "text-sm text-center"
            )}
          >
            Total Shielded NAM Balance
          </div>
        </div>

        <div
          className={twMerge(
            "relative",
            "flex flex-col gap-4 justify-between",
            "rounded-sm bg-neutral-900 p-4",
            !shieldingRewardsEnabled &&
              "opacity-25 pointer-events-none select-none"
          )}
        >
          <div className="absolute top-2 right-2 group/tooltip">
            <GoInfo />
            <Tooltip className="w-[300px]">
              Estimated rewards you will receive aprox. every 6 hours based on
              the amount of assets you hold in the shield pool
            </Tooltip>
          </div>
          <div
            className={twMerge(
              "text-sm text-center font-medium",
              "flex items-center justify-center py-4"
            )}
          >
            Your Est. Shielding
            <br />
            rewards per 24hrs
          </div>
          {shieldingRewardsEnabled ?
            <AsyncNamCurrency amount={shieldedRewards.amount} />
          : <div className="block text-center text-3xl">--</div>}
          <div
            className={twMerge(
              "border border-white rounded-md p-2 max-w-[200px] mx-auto mt-4",
              "text-white text-xs text-center"
            )}
          >
            {shieldingRewardsEnabled ?
              "Shielding more assets will increase your rewards"
            : "Shielding Rewards will be enabled in phase 4"}
          </div>
        </div>
      </div>
    </AtomErrorBoundary>
  );
};

import { SkeletonLoading, Stack, Tooltip } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { useBalances } from "hooks/useBalances";
import { GoInfo } from "react-icons/go";
import { twMerge } from "tailwind-merge";

export const ShieldedEstimatedRewards = (): JSX.Element => {
  const { isLoading, shieldedAmount } = useBalances();

  return (
    <AtomErrorBoundary
      // TODO shieldedQuery
      result={[]}
      niceError="Unable to load Est. Rewards"
    >
      <div className="flex flex-col gap-4 relative">
        <div className="absolute -top-3 -right-2 group/tooltip">
          <GoInfo />
          <Tooltip className="w-[300px]">
            Estimated rewards you will receive aprox. every 6 hours based on the
            amount of assets you hold in the shield pool
          </Tooltip>
        </div>
        <div
          className={twMerge(
            "text-sm text-center font-medium mb-2",
            "flex items-center justify-center h-[70px]"
          )}
        >
          Est. Rewards per
          <br />
          Epoch
        </div>

        {isLoading ?
          <Stack gap={2.5} className="h-[76px] items-center">
            <SkeletonLoading height="26px" width="100px" />
            <SkeletonLoading height="16px" width="50px" />
          </Stack>
        : <NamCurrency
            // TODO shieldedAmount
            amount={shieldedAmount}
            className="text-center text-3xl leading-none"
            currencySignClassName="block text-xs"
          />
        }
      </div>
    </AtomErrorBoundary>
  );
};

import { Image, SkeletonLoading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { useBalances } from "hooks/useBalances";
import { twMerge } from "tailwind-merge";

export const ShieldedNamBalance = (): JSX.Element => {
  const { isLoading, shieldedAmount } = useBalances();

  return (
    <AtomErrorBoundary
      // TODO shieldedQuery
      result={[]}
      niceError="Unable to load available NAM balance"
    >
      <div className="flex flex-col gap-3 text-yellow">
        <i className="block w-9 mx-auto">
          {/* TODO shielded icon */}
          <Image imageName="LogoMinimal" />
        </i>
        <div className="text-sm text-center font-medium mb-2">
          Shielded NAM Balance
        </div>

        {isLoading ?
          <Stack gap={2.5} className="h-[76px] items-center">
            <SkeletonLoading height="26px" width="100px" />
            <SkeletonLoading height="16px" width="50px" />
          </Stack>
        : <>
            <NamCurrency
              // TODO shieldedAmount
              amount={shieldedAmount}
              className="text-center text-3xl leading-none"
              currencySignClassName="block text-xs"
            />
            <div
              className={twMerge(
                "flex flex-col items-center p-4 mt-4",
                "mx-auto max-w-[170px] bg-neutral-900 rounded-sm"
              )}
            >
              {/* TODO percent */}
              <div className="text-2xl">0%</div>
              <div className="text-xs text-center mt-1 leading-tight">
                Your Current shielded reward rate
              </div>
            </div>
          </>
        }
      </div>
    </AtomErrorBoundary>
  );
};

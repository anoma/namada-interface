import { SkeletonLoading, Stack } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { useBalances } from "hooks/useBalances";
import { ShieldedNamIcon } from "./ShieldedNamIcon";

export const ShieldedNamBalance = (): JSX.Element => {
  const { isLoading, shieldedAmount } = useBalances();

  return (
    <AtomErrorBoundary
      // TODO shieldedQuery
      result={[]}
      niceError="Unable to load shielded NAM balance"
    >
      <div className="flex flex-col gap-4 text-yellow">
        <div className="flex flex-col items-center gap-1 text-sm text-center font-medium">
          <div>
            <ShieldedNamIcon />
          </div>
          <div>Shielded NAM Balance</div>
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

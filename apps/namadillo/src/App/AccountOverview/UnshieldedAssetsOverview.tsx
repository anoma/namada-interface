import { ActionButton, Panel, SkeletonLoading } from "@namada/components";
import { transparentTokensAtom } from "atoms/balance";
import { useAmountsInFiat } from "hooks/useAmountsInFiat";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { StakeYourNamCard } from "./StakeYourNamCard";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { UnshieldedAssetTable } from "./UnshieldedAssetTable";

export const UnshieldedAssetsOverview = (): JSX.Element => {
  const { unshieldedAmountInFiat } = useAmountsInFiat();
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);

  const nonZeroTransparentTokens = useMemo(() => {
    if (!transparentTokensQuery.data) return [];
    return transparentTokensQuery.data.filter((i) => i.amount.gt(0));
  }, [transparentTokensQuery.data]);

  const isLoading =
    transparentTokensQuery.isLoading ||
    (transparentTokensQuery.fetchStatus === "idle" &&
      !transparentTokensQuery.isFetched);

  return (
    <Panel className="relative z-10 px-6 rounded-t-none -mt-px">
      <div className="flex justify-between items-center gap-16 mt-4">
        <TotalBalanceCard
          balanceInFiat={unshieldedAmountInFiat}
          footerButtons={
            <>
              <ActionButton size="xs" className="w-auto px-4">
                Shielded Assets
              </ActionButton>
            </>
          }
        />
        <div>
          <StakeYourNamCard />
        </div>
      </div>
      {transparentTokensQuery.isSuccess && (
        <div className="mt-5 overflow-hidden">
          {nonZeroTransparentTokens.length ?
            <UnshieldedAssetTable />
          : <div className="bg-neutral-900 p-6 rounded-sm text-center font-medium my-14">
              You currently hold no assets in your unshielded account
            </div>
          }
        </div>
      )}
      {isLoading && (
        <div className="flex gap-1 flex-col mt-12">
          <div className="mb-4">
            <SkeletonLoading height="1.25em" width="150px" />
          </div>
          <SkeletonLoading height="50px" width="100%" />
          <SkeletonLoading height="50px" width="100%" />
          <SkeletonLoading height="50px" width="100%" />
        </div>
      )}
    </Panel>
  );
};

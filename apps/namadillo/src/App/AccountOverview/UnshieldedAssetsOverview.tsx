import { ActionButton, Panel, SkeletonLoading } from "@namada/components";
import { routes } from "App/routes";
import { transparentTokensAtom } from "atoms/balance";
import { useAmountsInFiat } from "hooks/useAmountsInFiat";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { StakeYourNamCard } from "./StakeYourNamCard";
import { TotalBalanceCard } from "./TotalBalanceCard";
import { UnshieldedAssetTable } from "./UnshieldedAssetTable";

export const UnshieldedAssetsOverview = (): JSX.Element => {
  const { unshieldedAmountInFiat } = useAmountsInFiat();
  const navigate = useNavigate();
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);

  const isLoading =
    transparentTokensQuery.isLoading ||
    (transparentTokensQuery.fetchStatus === "idle" &&
      !transparentTokensQuery.isFetched);

  return (
    <Panel className="relative z-10 px-6 rounded-t-none -mt-px h-full">
      <div className="flex justify-between items-center gap-16 mt-4">
        <TotalBalanceCard
          balanceInFiat={unshieldedAmountInFiat}
          footerButtons={
            <>
              <ActionButton
                onClick={() => navigate(routes.maspShield)}
                size="xs"
                className="w-auto px-4"
              >
                Shield Assets
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
          <UnshieldedAssetTable />
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

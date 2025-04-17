import { ActionButton, Panel } from "@namada/components";
import { MaspSyncCover } from "App/Common/MaspSyncCover";
import { ShieldedAssetTable } from "App/Masp/ShieldedAssetTable";
import { routes } from "App/routes";
import clsx from "clsx";
import { useAmountsInFiat } from "hooks/useAmountsInFiat";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { EstimateShieldingRewardsCard } from "./EstimateShieldingRewardsCard";
import { TotalBalanceCard } from "./TotalBalanceCard";

export const ShieldedAssetsOverview = (): JSX.Element => {
  const { shieldedAmountInFiat } = useAmountsInFiat();
  const textContainerClassList = `flex h-full gap-1 items-center justify-center`;
  const requiresNewShieldedSync = useRequiresNewShieldedSync();

  return (
    <Panel className="relative z-10 px-6 border border-yellow rounded-t-none -mt-px h-full">
      <div className="flex items-center gap-16 mt-4">
        <TotalBalanceCard
          balanceInFiat={shieldedAmountInFiat}
          isShielded={true}
          footerButtons={
            <>
              <ActionButton
                href={routes.transfer}
                outlineColor="yellow"
                size="xs"
                className="w-auto px-4"
              >
                <span className={clsx(textContainerClassList)}>
                  Shielded Transfer
                </span>
              </ActionButton>
              <ActionButton
                href={routes.maspUnshield}
                outlineColor="white"
                size="xs"
                className="w-auto px-4 items-center"
              >
                <span className={clsx(textContainerClassList)}>Unshield</span>
              </ActionButton>
            </>
          }
        />
        <EstimateShieldingRewardsCard />
      </div>
      <div className="mt-10">
        <ShieldedAssetTable />
      </div>
      {requiresNewShieldedSync && <MaspSyncCover />}
    </Panel>
  );
};

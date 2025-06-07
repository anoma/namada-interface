import { Panel, SkeletonLoading, Stack, Tooltip } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { PulsingRing } from "App/Common/PulsingRing";
import { shieldedBalanceAtom } from "atoms/balance";
import { applicationFeaturesAtom } from "atoms/settings";
import clsx from "clsx";
import { useAmountsInFiat } from "hooks/useAmountsInFiat";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";

export const TotalBalanceBanner = (): JSX.Element => {
  const { namTransfersEnabled } = useAtomValue(applicationFeaturesAtom);
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);
  const requiresNewShieldedSync = useRequiresNewShieldedSync();
  const shouldWaitForShieldedSync = requiresNewShieldedSync && isShieldSyncing;
  const { shieldedQuery, unshieldedQuery, totalAmountInFiat } =
    useAmountsInFiat();

  const balancesHaveLoaded =
    shieldedQuery.isSuccess && unshieldedQuery.isSuccess;
  const hasErrors = shieldedQuery.isError && unshieldedQuery.isError;
  const balanceIsLoading = !balancesHaveLoaded && !hasErrors;

  return (
    <Panel className="py-4">
      <Stack
        direction="horizontal"
        className="items-center justify-between px-4"
      >
        <div className="text-white">
          <header className="text-sm mb-3">
            <div className="flex items-center">
              Total Balance in Namada
              {shouldWaitForShieldedSync && (
                <span className="relative px-1.5 text-yellow group/tooltip">
                  <GoInfo />
                  <Tooltip className="z-40 w-74" position="right">
                    The total amount of your shielded assets will be available
                    once Shielded Sync is complete.
                  </Tooltip>
                </span>
              )}
            </div>
            {!namTransfersEnabled && (
              <small className="block text-xxs text-neutral-400">
                Balance excludes NAM until phase 5
              </small>
            )}
          </header>
          {balanceIsLoading && (
            <SkeletonLoading height="1em" width="200px" className="text-5xl" />
          )}
          {balancesHaveLoaded && (
            <div className={clsx("flex items-center text-5xl leading-none")}>
              <FiatCurrency amount={totalAmountInFiat} />
              <div className="relative group/tooltip">
                {shouldWaitForShieldedSync && (
                  <span
                    className="relative text-xs ml-9"
                    title="Shielded sync in progress..."
                  >
                    <PulsingRing />
                  </span>
                )}
                <Tooltip position="bottom" className="z-10 w-[190px] py-3 -mb-4">
                  <div className="space-y-3 w-full text-xs font-medium text-yellow">
                    {shouldWaitForShieldedSync ?
                        <div className="text-sm text-white">
                          Syncing your shielded assets now. Balances will update in a
                          few seconds.
                        </div>                      
                    : <div>Shielded sync completed</div>}
                  </div>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        {/* <aside className="hidden lg:flex gap-4 items-center flex-wrap">
          <ActionButton
            onClick={() =>
              navigate(routes.maspShield)
            }
            size="sm"
            className="w-auto px-3 py-1.5"
          >
            Shield your Assets!
          </ActionButton>
          <div className="w-[140px]">
            <TokensAnimation />
          </div>
        </aside> */}
      </Stack>
    </Panel>
  );
};

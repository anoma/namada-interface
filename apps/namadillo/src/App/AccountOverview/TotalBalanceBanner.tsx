import {
  ActionButton,
  Panel,
  SkeletonLoading,
  Stack,
  Tooltip,
} from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { PulsingRing } from "App/Common/PulsingRing";
import { TokensAnimation } from "App/Common/TokensAnimation";
import {
  shieldedBalanceAtom,
  shieldedTokensAtom,
  transparentTokensAtom,
} from "atoms/balance";
import { getTotalDollar } from "atoms/balance/functions";
import { applicationFeaturesAtom } from "atoms/settings";
import clsx from "clsx";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";

export const TotalBalanceBanner = (): JSX.Element => {
  const { namTransfersEnabled } = useAtomValue(applicationFeaturesAtom);
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);

  const requiresNewShieldedSync = useRequiresNewShieldedSync();
  const shouldWaitForShieldedSync = requiresNewShieldedSync && isShieldSyncing;
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);
  const transparentTokensQuery = useAtomValue(transparentTokensAtom);
  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);
  const transparentDollars = getTotalDollar(transparentTokensQuery.data);
  const totalAmountInDollars = shieldedDollars.plus(transparentDollars);

  const balancesHaveLoaded =
    shieldedTokensQuery.isSuccess && transparentTokensQuery.isSuccess;

  const hasErrors =
    shieldedTokensQuery.isError && transparentTokensQuery.isError;

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
            <SkeletonLoading height="1em" width="200px" className="text-6xl" />
          )}
          {balancesHaveLoaded && (
            <div className={clsx("flex items-center text-7xl leading-none")}>
              <FiatCurrency amount={totalAmountInDollars} />
              {shouldWaitForShieldedSync && (
                <span
                  className="relative text-xs ml-9"
                  title="Shielded sync in progress..."
                >
                  <PulsingRing />
                </span>
              )}
            </div>
          )}
        </div>
        <aside className="flex gap-4 items-center flex-wrap">
          <ActionButton size="sm" className="w-auto px-3 py-1.5">
            Shield your Assets!
          </ActionButton>
          <div className="w-[140px]">
            <TokensAnimation />
          </div>
        </aside>
      </Stack>
    </Panel>
  );
};

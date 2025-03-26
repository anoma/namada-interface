import {
  ActionButton,
  Panel,
  SkeletonLoading,
  Stack,
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
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";

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

  const balanceIsLoading =
    shieldedTokensQuery.isLoading || transparentTokensQuery.isLoading;

  const balancesHaveLoaded =
    shieldedTokensQuery.isSuccess && transparentTokensQuery.isSuccess;

  return (
    <Panel className="py-4">
      <Stack
        direction="horizontal"
        className="items-center justify-between px-4"
      >
        <div className="text-white">
          <header className="text-sm mb-3">Total Balance in Namada</header>
          {balanceIsLoading && (
            <SkeletonLoading height="1em" width="200px" className="text-6xl" />
          )}
          {balancesHaveLoaded && (
            <div className="text-6xl leading-none animate-fade-in">
              <FiatCurrency amount={totalAmountInDollars} />
              {!namTransfersEnabled && (
                <small className="text-xl align-super">&nbsp;*</small>
              )}
              <span className="relative">
                <PulsingRing />
              </span>
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

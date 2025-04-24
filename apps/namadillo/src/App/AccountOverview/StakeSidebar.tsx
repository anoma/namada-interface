import { ActionButton, Panel, SkeletonLoading } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { routes } from "App/routes";
import { chainParametersAtom } from "atoms/chain";
import { claimableRewardsAtom } from "atoms/staking";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { sumBigNumberArray } from "utils";

export const StakeSidebar = (): JSX.Element => {
  const { isLoading, bondedAmount } = useBalances();
  const { data: rewards, isSuccess: successfullyLoadedRewards } =
    useAtomValue(claimableRewardsAtom);
  const chainParams = useAtomValue(chainParametersAtom);

  const location = useLocation();
  const navigate = useNavigate();
  const availableRewards = sumBigNumberArray(Object.values(rewards || {}));
  const displayRewardsBox =
    successfullyLoadedRewards &&
    Object.values(rewards || {}).length > 0 &&
    chainParams.isSuccess;

  return (
    <Panel className="flex flex-col gap-4 text-cyan px-3">
      <div className="px-4">
        <h3 className="text-sm mb-1">Total Staked NAM</h3>
        {isLoading ?
          <SkeletonLoading width="100%" height="60px" />
        : <NamCurrency
            amount={bondedAmount}
            className="text-lg"
            decimalPlaces={2}
          />
        }
      </div>
      {displayRewardsBox && (
        <Panel className="flex flex-col gap-4 bg-neutral-900 px-3 py-4 text-cyan">
          <h3 className="text-xs text-center">Unclaimed Staking Rewards</h3>
          <NamCurrency
            amount={availableRewards}
            className="text-2xl leading-[1em] text-center [&>span]:block"
            decimalPlaces={2}
          />
          <ActionButton
            className="w-auto mx-auto"
            size="xs"
            backgroundColor="cyan"
            backgroundHoverColor="white"
            textColor="black"
            textHoverColor="black"
            onClick={() =>
              navigate(routes.stakingClaimRewards, {
                state: { backgroundLocation: location },
              })
            }
          >
            Claim
          </ActionButton>
          <footer className="text-center leading-snug">
            {chainParams.data?.apr.multipliedBy(100).toFixed(2)}%
            <div className="text-xxs text-center">Est. Rewards Rate</div>
          </footer>
        </Panel>
      )}
    </Panel>
  );
};

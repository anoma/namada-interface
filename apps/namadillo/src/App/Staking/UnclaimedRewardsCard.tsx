import { ActionButton, SkeletonLoading } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { routes } from "App/routes";
import { chainParametersAtom } from "atoms/chain";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useLocation, useNavigate } from "react-router-dom";
import { sumBigNumberArray } from "utils";

export const UnclaimedRewardsCard = (): JSX.Element => {
  const chainParameters = useAtomValue(chainParametersAtom);
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const { data: rewards, isLoading: rewardsLoading } =
    useAtomValue(claimableRewardsAtom);
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={clsx(
        "flex justify-between md:flex-row bg-neutral-800",
        "rounded-sm justify-between p-4 gap-5"
      )}
    >
      <div className="flex flex-col items-center gap-2 px-4">
        <span className="text-xs text-center leading-tight text-neutral-500">
          Unclaimed Staking Rewards
        </span>{" "}
        {rewardsLoading ?
          <SkeletonLoading height="1em" width="200px" className="text-3xl" />
        : <NamCurrency
            amount={availableRewards}
            className="text-2xl/tight text-center"
            decimalPlaces={2}
          />
        }
        <ActionButton
          size="xs"
          className="w-auto"
          backgroundColor="cyan"
          textColor="black"
          onClick={() => {
            navigate(routes.stakingClaimRewards, {
              state: {
                backgroundLocation: location,
              },
            });
          }}
        >
          Claim
        </ActionButton>
      </div>
      <div className="flex items-center bg-rblack px-6 rounded-sm">
        <div className="space-y-2">
          <div className="text-sm/tight text-white -mb-1 text-center">
            {chainParameters?.data?.apr ?
              chainParameters.data.apr.multipliedBy(100).toFixed(2)
            : "--"}
            %
          </div>
          <span className="block text-xs/tight text-neutral-700 text-center">
            Est. Rewards Rate
          </span>
        </div>
      </div>
    </div>
  );
};

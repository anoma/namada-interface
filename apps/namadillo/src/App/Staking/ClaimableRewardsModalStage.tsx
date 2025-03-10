import { ActionButton, SkeletonLoading, Stack } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { applicationFeaturesAtom } from "atoms/settings";
import { allValidatorsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { AddressBalance } from "types";
import { sumBigNumberArray } from "utils";
import { ValidatorCard } from "./ValidatorCard";

type ClaimableStakingRewardsProps = {
  rewards?: AddressBalance;
  isLoadingRewards: boolean;
  onClaim: (balances: AddressBalance) => void;
  onClaimAndStake: (balances: AddressBalance) => void;
  isEnabled: boolean;
};

export const ClaimableRewardsModalStage = ({
  rewards,
  isLoadingRewards,
  onClaim,
  onClaimAndStake,
  isEnabled,
}: ClaimableStakingRewardsProps): JSX.Element => {
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const validators = useAtomValue(allValidatorsAtom);

  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);

  const renderValidatorCard = (validatorAddress: string): JSX.Element => {
    const validator = validators.data?.find(
      (v) => v.address === validatorAddress
    );
    if (!validator) return <></>;
    return (
      <div className="grid grid-cols-[1.25fr_1fr_1.5fr] items-center text-sm">
        <ValidatorCard validator={validator} showAddress={false} />
        <span className="text-left">
          {rewards && <NamCurrency amount={rewards[validatorAddress]} />}
        </span>
        <Stack direction="horizontal" gap={1}>
          <ActionButton
            backgroundColor="cyan"
            onClick={() =>
              rewards &&
              onClaimAndStake({
                [validatorAddress]: rewards[validatorAddress],
              })
            }
            disabled={!isEnabled}
            size="xs"
            className="px-1 py-2"
          >
            Claim & Stake
          </ActionButton>
          <ActionButton
            backgroundColor="white"
            onClick={() =>
              rewards &&
              onClaim({ [validatorAddress]: rewards[validatorAddress] })
            }
            disabled={!isEnabled}
            size="xs"
            className="px-1 py-2"
          >
            Claim
          </ActionButton>
        </Stack>
      </div>
    );
  };

  return (
    <Stack gap={5} className="bg-black py-6 px-6 rounded-md flex-1">
      <Stack gap={0} className="items-center text-sm">
        <h2 className="text-center text-white">Total Claimable Rewards</h2>
        <div>
          {isLoadingRewards && <SkeletonLoading width="200px" height="60px" />}
          {rewards && (
            <NamCurrency className="text-5xl" amount={availableRewards} />
          )}
        </div>
      </Stack>
      <Stack gap={2}>
        <ActionButton
          backgroundColor="cyan"
          onClick={() => rewards && onClaimAndStake(rewards)}
          disabled={availableRewards.eq(0) || !isEnabled}
        >
          Claim & Stake All
        </ActionButton>
        <ActionButton
          backgroundColor="white"
          onClick={() => rewards && onClaim(rewards)}
          disabled={availableRewards.eq(0) || !isEnabled}
          type="button"
        >
          Claim All
        </ActionButton>
      </Stack>
      <hr className="bg-neutral-400" />
      <div>
        <header className="grid grid-cols-3 text-xs text-neutral-400 mb-2">
          <span>Validator</span>
          <span>Staking reward</span>
        </header>
        <Stack gap={2} as="ul" className="max-h-[280px] overflow-auto -mx-4">
          {Object.keys(rewards || {}).map((validatorAddress, index) => (
            <li
              key={index}
              className={clsx("py-3 rounded-sm px-4", {
                "bg-neutral-900": index % 2,
              })}
            >
              {renderValidatorCard(validatorAddress)}
            </li>
          ))}
        </Stack>
      </div>
    </Stack>
  );
};

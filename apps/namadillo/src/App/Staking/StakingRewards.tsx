import {
  ActionButton,
  Modal,
  SkeletonLoading,
  Stack,
} from "@namada/components";
import { ClaimRewardsMsgValue } from "@namada/types";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { defaultAccountAtom } from "atoms/accounts";
import {
  claimableRewardsAtom,
  claimAndStakeRewardsAtom,
  claimRewardsAtom,
} from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const StakingRewards = (): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    isLoading: isLoadingRewards,
    isSuccess,
    data: rewards,
  } = useAtomValue(claimableRewardsAtom);

  const { onCloseModal } = useModalCloseEvent();

  const parseStakingRewardsParams = (): ClaimRewardsMsgValue[] => {
    if (!rewards || Object.values(rewards).length === 0 || !account) return [];
    return Object.keys(rewards).map((validatorAddress) => {
      return {
        validator: validatorAddress,
        source: account.address,
      };
    });
  };

  const {
    execute: claimRewards,
    isEnabled: claimRewardsEnabled,
    isPending: claimRewardsPending,
  } = useTransaction({
    params: parseStakingRewardsParams(),
    createTxAtom: claimRewardsAtom,
    eventType: "ClaimRewards",
    parsePendingTxNotification: () => ({
      title: "Claim rewards transaction is in progress",
      description: <>Your rewards claim is being processed</>,
    }),
    onSuccess: () => {
      onCloseModal();
    },
  });

  const {
    execute: claimRewardsAndStake,
    isEnabled: claimAndStakeEnabled,
    isPending: claimAndStakePending,
  } = useTransaction({
    params: parseStakingRewardsParams(),
    createTxAtom: claimAndStakeRewardsAtom,
    eventType: "ClaimRewards",
    parsePendingTxNotification: () => ({
      title: "Claim rewards transaction is in progress",
      description: (
        <>
          Your rewards claim is being processed and will be staked to the same
          validators afterward.
        </>
      ),
    }),
    onSuccess: () => {
      onCloseModal();
    },
  });

  const availableRewards = useMemo(() => {
    if (!rewards || Object.keys(rewards).length === 0) return BigNumber(0);
    return BigNumber.sum(...Object.values(rewards || []));
  }, [rewards]);

  const isLoading = claimRewardsPending || claimAndStakePending;

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header="Claimable Staking Rewards"
        onClose={onCloseModal}
        containerProps={{ className: "lg:w-[540px] lg:h-[auto]" }}
        contentProps={{ className: "flex" }}
      >
        <Stack gap={8} className="bg-rblack py-7 px-8 rounded-md flex-1">
          <Stack gap={2} className="items-center ">
            <img src={claimRewardsSvg} alt="" className="w-22 mx-auto" />
            <div>
              {isLoadingRewards && (
                <SkeletonLoading width="200px" height="60px" />
              )}
              {isSuccess && (
                <NamCurrency className="text-4xl" amount={availableRewards} />
              )}
            </div>
          </Stack>
          <Stack gap={2}>
            <ActionButton
              backgroundColor="cyan"
              onClick={() => claimRewardsAndStake()}
              disabled={
                availableRewards.eq(0) || !claimAndStakeEnabled || isLoading
              }
            >
              {claimAndStakePending ? "Loading..." : "Claim & Stake"}
            </ActionButton>
            <ActionButton
              backgroundColor="white"
              onClick={() => claimRewards()}
              disabled={
                availableRewards.eq(0) || !claimRewardsEnabled || isLoading
              }
              type="button"
            >
              {claimRewardsPending ? "Loading..." : "Claim"}
            </ActionButton>
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

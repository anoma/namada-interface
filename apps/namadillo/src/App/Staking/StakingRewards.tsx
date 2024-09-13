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
import { applicationFeaturesAtom } from "atoms/settings";
import {
  claimableRewardsAtom,
  claimAndStakeRewardsAtom,
  claimRewardsAtom,
} from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { sumBigNumberArray } from "utils";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const StakingRewards = (): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
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
    isEnabled: claimRewardsTxEnabled,
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
    isEnabled: claimAndStakeTxEnabled,
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

  const isLoading = claimRewardsPending || claimAndStakePending;
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header="Claimable Staking Rewards"
        onClose={onCloseModal}
        containerProps={{ className: "md:!w-[540px] md:!h-[auto]" }}
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
                availableRewards.eq(0) || !claimAndStakeTxEnabled || isLoading
              }
            >
              {claimAndStakePending ? "Loading..." : "Claim & Stake"}
            </ActionButton>
            <ActionButton
              backgroundColor="white"
              onClick={() => claimRewards()}
              disabled={
                availableRewards.eq(0) || !claimRewardsTxEnabled || isLoading
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

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
import { claimableRewardsAtom, claimRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const StakingRewards = (): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    isLoading,
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

  const { execute: claimOnly, isEnabled } = useTransaction({
    params: parseStakingRewardsParams(),
    createTxAtom: claimRewardsAtom,
    eventType: "ClaimRewards",
    pendingTxNotification: {
      title: "Claiming rewards transaction in progress",
      description: <>Your rewards claim is being processed</>,
    },
    onSuccess: () => {
      onCloseModal();
    },
  });

  const availableRewards = useMemo(() => {
    return BigNumber.sum(...Object.values(rewards || []));
  }, [rewards]);

  const onClaimAndStake = (e: React.MouseEvent): void => {
    e.preventDefault();
  };

  const onClaim = async (): Promise<void> => {
    claimOnly();
  };

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
              {isLoading && <SkeletonLoading width="200px" height="60px" />}
              {isSuccess && (
                <NamCurrency className="text-4xl" amount={availableRewards} />
              )}
            </div>
          </Stack>
          <Stack gap={2}>
            <ActionButton
              backgroundColor="cyan"
              onClick={onClaimAndStake}
              disabled={true}
            >
              Claim & Stake
            </ActionButton>
            <ActionButton
              backgroundColor="white"
              onClick={onClaim}
              disabled={!isEnabled}
              type="button"
            >
              Claim
            </ActionButton>
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

import {
  ActionButton,
  Modal,
  SkeletonLoading,
  Stack,
} from "@namada/components";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const StakingRewards = (): JSX.Element => {
  const {
    isLoading,
    isSuccess,
    data: rewards,
  } = useAtomValue(claimableRewardsAtom);

  const { onCloseModal } = useModalCloseEvent();

  const availableRewards = useMemo(() => {
    return BigNumber.sum(...Object.values(rewards || []));
  }, [rewards]);

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
              disabled={!isSuccess || availableRewards.eq(0)}
            >
              Claim & Stake
            </ActionButton>
            <ActionButton
              backgroundColor="white"
              disabled={!isSuccess || availableRewards.eq(0)}
            >
              Stake
            </ActionButton>
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

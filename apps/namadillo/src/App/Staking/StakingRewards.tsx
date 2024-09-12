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
import { defaultGasConfigFamily } from "atoms/fees";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import { claimableRewardsAtom, claimRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { broadcastTx, TransactionPair } from "lib/query";
import { useMemo } from "react";
import { ClaimRewardsProps } from "types";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const StakingRewards = (): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const {
    isLoading,
    isSuccess,
    data: rewards,
  } = useAtomValue(claimableRewardsAtom);

  const { mutateAsync: claimOnly, isPending: isClaiming } =
    useAtomValue(claimRewardsAtom);

  const gasConfig = useAtomValue(
    defaultGasConfigFamily(
      Array(Object.keys(rewards || {}).length).fill("ClaimRewards")
    )
  );

  const { onCloseModal } = useModalCloseEvent();

  const availableRewards = useMemo(() => {
    return BigNumber.sum(...Object.values(rewards || []));
  }, [rewards]);

  const getClaimRewardsProps = (): ClaimRewardsProps => {
    const validators = Object.keys(rewards || {});
    invariant(account?.address, "Default account is null");
    invariant(gasConfig.data, "Gas config not loaded");
    invariant(validators.length > 0, "No claim rewards provided");
    return {
      account,
      gasConfig: gasConfig.data,
      validators,
    };
  };

  const onClaimAndStake = (e: React.MouseEvent): void => {
    e.preventDefault();
  };

  const dispatchClaimRewardsTransaction = (
    tx: TransactionPair<ClaimRewardsMsgValue>
  ): void => {
    tx.signedTxs.forEach((signedTx) => {
      broadcastTx(
        tx.encodedTxData,
        signedTx,
        tx.encodedTxData.meta?.props,
        "ReDelegate"
      );
    });
  };

  const dispatchPendingNotification = (
    data?: TransactionPair<ClaimRewardsMsgValue>
  ): void => {
    dispatchNotification({
      id: createNotificationId(data?.encodedTxData.txs),
      title: "Claiming rewards transaction in progress",
      description: <>Your rewards claim is being processed</>,
      type: "pending",
    });
  };

  const onClaim = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault();
    const txData = await claimOnly(getClaimRewardsProps());
    dispatchClaimRewardsTransaction(txData);
    dispatchPendingNotification(txData);
    onCloseModal();
  };

  const disableButtons =
    !isSuccess || availableRewards.eq(0) || !account || isClaiming;

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
              disabled={disableButtons}
            >
              Claim & Stake
            </ActionButton>
            <ActionButton
              backgroundColor="white"
              onClick={onClaim}
              disabled={disableButtons}
            >
              Claim
            </ActionButton>
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

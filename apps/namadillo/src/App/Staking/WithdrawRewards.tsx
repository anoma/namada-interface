import { InlineError } from ", WithdrawMsgValueApp/Common/InlineError";
import {
  ActionButton,
  Modal,
  SkeletonLoading,
  Stack,
} from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { TransactionFeeButton } from "App/Common/TransactionFeeButton";
import { defaultAccountAtom } from "atoms/accounts";
import { createWithdrawTxAtomFamily } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { sumBigNumberArray } from "utils";
import claimRewardsSvg from "./assets/claim-rewards.svg";

export const WithdrawRewards = ({ myValidator }): JSX.Element => {
  const { onCloseModal } = useModalCloseEvent();
  const { data: account } = useAtomValue(defaultAccountAtom);

  const getFamilyId = (): string =>
    `${myValidator.validator.address}- ${unbondingEntry.amount}`;

  const parseWithdrawParams = (): WithdrawMsgValue[] => {
    if (!account?.address) return [];
    return [
      { validator: myValidator.validator.address, source: account?.address },
    ];
  };

  const {
    execute: performWithdraw,
    isPending: withdrawPending,
    isSuccess,
    isEnabled: claimWithdrawalEnabled,
    error: withdrawError,
    feeProps: withdrawFeeProps,
  } = useTransaction({
    createTxAtom: createWithdrawTxAtomFamily(getFamilyId()),
    params: parseWithdrawParams(),
    eventType: "Withdraw",
    parsePendingTxNotification: () => ({
      title: "Withdrawal transaction in progress",
      description: (
        <>
          The withdrawal of{" "}
          <NamCurrency amount={new BigNumber(unbondingEntry.amount)} /> is being
          processed
        </>
      ),
    }),
    parseErrorTxNotification: () => ({
      title: "Withdrawal transaction failed",
      description: "",
    }),
  });

  useEffect(() => {
    return () => {
      // On detach we have to remove the param to avoid memory leaks
      createWithdrawTxAtomFamily.remove(getFamilyId());
    };
  }, []);

  //   const {
  //     execute: claimRewardsAndStake,
  //     isEnabled: claimAndStakeTxEnabled,
  //     isPending: claimAndStakePending,
  //     error: claimAndStakeError,
  //     feeProps: claimAndStakeFeeProps,
  //   } = useTransaction({
  //     params: parseStakingRewardsParams(),
  //     createTxAtom: claimAndStakeRewardsAtom,
  //     eventType: "ClaimRewards",
  //     parsePendingTxNotification: () => ({
  //       title: "Claim rewards transaction is in progress",
  //       description: (
  //         <>
  //           Your rewards claim is being processed and will be staked to the same
  //           validators afterward.
  //         </>
  //       ),
  //     }),
  //     onBroadcasted: () => {
  //       onCloseModal();
  //     },
  //   });

  const isLoading = withdrawPending;
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);

  const error = withdrawError?.message;

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header="Claimable Staking Rewards"
        onClose={onCloseModal}
        containerProps={{ className: "md:!w-[540px] md:!h-[auto]" }}
        contentProps={{ className: "flex" }}
      >
        <Stack gap={8} className="bg-black py-7 px-8 rounded-md flex-1">
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
              onClick={() => performWithdraw()}
              disabled={availableRewards.eq(0) || isLoading}
            >
              {withdrawPending ? "Loading..." : "Withdraw"}
            </ActionButton>
            <TransactionFeeButton feeProps={withdrawFeeProps} />
            <InlineError errorMessage={error} />
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

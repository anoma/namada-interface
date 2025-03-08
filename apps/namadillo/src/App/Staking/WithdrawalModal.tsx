import { ActionButton, Modal, Stack } from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { InlineError } from "App/Common/InlineError";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { TransactionFeeButton } from "App/Common/TransactionFeeButton";
import { defaultAccountAtom } from "atoms/accounts";
import { createWithdrawTxAtomFamily } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useModalCloseEvent } from "hooks/useModalCloseEvent";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

type WithdrawalModalProps = {
  validatorAddress: string;
  amount: string;
};

export const WithdrawalModal = ({}: WithdrawalModalProps): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const { onCloseModal } = useModalCloseEvent();
  const navigate = useNavigate();

  const getFamilyId = (): string => `${validatorAddress}-${amount}`;

  const parseWithdrawParams = (): WithdrawMsgValue[] => {
    if (!account?.address) return [];
    return [{ validator: validatorAddress, source: account?.address }];
  };

  const {
    execute: performWithdraw,
    isPending,
    isEnabled,
    feeProps,
  } = useTransaction({
    createTxAtom: createWithdrawTxAtomFamily(getFamilyId()),
    params: parseWithdrawParams(),
    eventType: "Withdraw",
    parsePendingTxNotification: () => ({
      title: "Withdrawal transaction in progress",
      description: (
        <>
          The withdrawal of <NamCurrency amount={new BigNumber(amount)} /> is
          being processed
        </>
      ),
    }),
    parseErrorTxNotification: () => ({
      title: "Withdrawal transaction failed",
      description: "",
    }),
    onBroadcasted: () => {
      onCloseModal();
      navigate(-1);
    },
  });

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer
        header="Confirm Withdrawal"
        onClose={onCloseModal}
        containerProps={{ className: "md:!w-[540px] md:!h-[auto]" }}
        contentProps={{ className: "flex" }}
      >
        <Stack gap={8} className="bg-black py-7 px-8 rounded-md flex-1">
          <Stack gap={2} className="items-center">
            <div>
              <NamCurrency
                className="text-4xl"
                amount={new BigNumber(amount)}
              />
            </div>
          </Stack>
          <Stack gap={2}>
            <ActionButton
              backgroundColor="white"
              onClick={() => performWithdraw()}
              disabled={!isEnabled}
              type="button"
            >
              {isPending ? "Processing..." : "Confirm Withdrawal"}
            </ActionButton>
            <TransactionFeeButton feeProps={feeProps} />
            <InlineError errorMessage={""} />
          </Stack>
        </Stack>
      </ModalContainer>
    </Modal>
  );
};

import { ActionButton, Modal, Stack } from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { InlineError } from "App/Common/InlineError";
import { ModalContainer } from "App/Common/ModalContainer";
import { NamCurrency } from "App/Common/NamCurrency";
import { TransactionFeeButton } from "App/Common/TransactionFeeButton";
import { defaultAccountAtom } from "atoms/accounts";
import { createWithdrawTxAtomFamily } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useTransaction } from "hooks/useTransaction";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { MyValidator, UnbondEntry } from "types";
import withdrawSvg from "./assets/claim-rewards.svg";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
  unbondingEntry: UnbondEntry;
};

export const WithdrawalButton = ({
  myValidator,
  unbondingEntry,
}: WithdrawalButtonProps): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    isPending,
    isSuccess,
    isEnabled,
    error,
    feeProps,
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
    onBroadcasted: () => {
      setIsModalOpen(false);
    },
  });

  useEffect(() => {
    return () => {
      // On detach we have to remove the param to avoid memory leaks
      createWithdrawTxAtomFamily.remove(getFamilyId());
    };
  }, []);

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const onWithdraw = (): void => {
    performWithdraw();
  };

  return (
    <>
      <ActionButton
        size="xs"
        outlineColor="white"
        disabled={!unbondingEntry.canWithdraw || !isEnabled}
        onClick={() => setIsModalOpen(true)}
      >
        {isSuccess && "Claimed"}
        {isPending && "Processing"}
        {!isSuccess && !isPending && "Withdraw"}
      </ActionButton>

      {isModalOpen && (
        <Modal isOpen={true} onClose={handleCloseModal}>
          <ModalContainer
            header="Withdraw Unbonded Tokens"
            onClose={handleCloseModal}
            containerProps={{ className: "md:!w-[540px] md:!h-[auto]" }}
            contentProps={{ className: "flex" }}
          >
            <Stack gap={8} className="bg-black py-7 px-8 rounded-md flex-1">
              <Stack gap={2} className="items-center">
                <img src={withdrawSvg} alt="" className="w-22 mx-auto" />
                <div>
                  <NamCurrency
                    className="text-4xl"
                    amount={new BigNumber(unbondingEntry.amount)}
                  />
                </div>
                <div className="text-center text-sm text-gray-400">
                  Validator:{" "}
                  {myValidator.validator.moniker ||
                    myValidator.validator.address}
                </div>
              </Stack>
              <Stack gap={2}>
                <ActionButton
                  backgroundColor="cyan"
                  onClick={onWithdraw}
                  disabled={!isEnabled || isPending}
                >
                  {isPending ? "Processing..." : "Withdraw"}
                </ActionButton>
                <TransactionFeeButton feeProps={feeProps} />
                <InlineError errorMessage={error?.message} />
              </Stack>
            </Stack>
          </ModalContainer>
        </Modal>
      )}
    </>
  );
};

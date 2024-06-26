import { ActionButton } from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { ToastErrorDescription } from "App/Common/ToastErrorDescription";
import { defaultAccountAtom } from "atoms/accounts";
import { gasLimitsAtom } from "atoms/fees";
import { dispatchToastNotificationAtom } from "atoms/notifications";
import { createWithdrawTxAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import { useGasEstimate } from "hooks/useGasEstimate";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { useCallback, useEffect } from "react";
import { MyValidator } from "types";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
};

export const WithdrawalButton = ({
  myValidator,
}: WithdrawalButtonProps): JSX.Element => {
  const { gasPrice } = useGasEstimate();
  const gasLimits = useAtomValue(gasLimitsAtom);
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);

  const {
    mutate: createWithdrawTx,
    data: withdrawalTxs,
    isPending,
    isSuccess,
    isError,
    error: withdrawalTransactionError,
  } = useAtomValue(createWithdrawTxAtom(JSON.stringify(myValidator)));

  const onWithdraw = useCallback(
    async (myValidator: MyValidator) => {
      invariant(
        account,
        "Extension is not connected or you don't have an account"
      );
      invariant(gasPrice, "Gas price loading is still pending");
      invariant(gasLimits.isSuccess, "Gas limit loading is still pending");
      invariant(
        myValidator.withdrawableAmount,
        "Validator doesn't have amounts available for withdrawal"
      );
      createWithdrawTx({
        changes: [
          {
            validatorId: myValidator.validator.address,
            amount: myValidator.withdrawableAmount!,
          },
        ],
        gasConfig: {
          gasPrice: gasPrice!,
          gasLimit: gasLimits.data!.Withdraw.native,
        },
        account: account!,
      });
    },
    [gasLimits.isSuccess, gasPrice, account, myValidator.withdrawableAmount]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatchWithdrawalTransactions = async (
    tx: TransactionPair<WithdrawMsgValue>
  ): Promise<void> => {
    broadcastTx(
      tx.encodedTxData.tx,
      tx.signedTx,
      tx.encodedTxData.meta?.props,
      "Withdraw"
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatchPendingNotification = (
    transaction: TransactionPair<WithdrawMsgValue>
  ): void => {
    dispatchNotification({
      id: transaction.encodedTxData.tx.tx_hash(),
      title: "Withdrawal transaction in progress",
      description: (
        <>
          The withdrawal of{" "}
          <NamCurrency
            amount={myValidator.withdrawableAmount || new BigNumber(0)}
          />{" "}
          is being processed
        </>
      ),
      type: "pending",
    });
  };

  useEffect(() => {
    if (isError) {
      dispatchNotification({
        id: "withdrawal-error",
        title: "Withdrawal transaction failed",
        description: (
          <ToastErrorDescription
            errorMessage={
              withdrawalTransactionError instanceof Error ?
                withdrawalTransactionError.message
              : undefined
            }
          />
        ),
        type: "error",
      });
    }
  }, [isError]);

  useEffect(() => {
    if (withdrawalTxs) {
      for (const tx of withdrawalTxs) {
        dispatchPendingNotification(tx);
        dispatchWithdrawalTransactions(tx);
      }
    }
  }, [isSuccess]);

  return (
    <ActionButton
      size="xs"
      color="white"
      outlined
      borderRadius="sm"
      disabled={
        !myValidator.withdrawableAmount || isPending || isSuccess || !gasPrice
      }
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {!isSuccess && !isPending && "Withdraw"}
    </ActionButton>
  );
};

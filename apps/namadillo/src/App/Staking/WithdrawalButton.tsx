import { ActionButton } from "@namada/components";
import { WithdrawMsgValue } from "@namada/types";
import { NamCurrency } from "App/Common/NamCurrency";
import BigNumber from "bignumber.js";
import { useGasEstimate } from "hooks/useGasEstimate";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { useCallback, useEffect } from "react";
import { defaultAccountAtom } from "slices/accounts";
import { GAS_LIMIT } from "slices/fees";
import { dispatchToastNotificationAtom } from "slices/notifications";
import { createWithdrawTxAtom } from "slices/staking";
import { MyValidator } from "slices/validators";

type WithdrawalButtonProps = {
  myValidator: MyValidator;
};

export const WithdrawalButton = ({
  myValidator,
}: WithdrawalButtonProps): JSX.Element => {
  const { gasPrice } = useGasEstimate();
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const {
    mutate: createWithdrawTx,
    data: withdrawalTxs,
    isPending,
    isSuccess,
  } = useAtomValue(createWithdrawTxAtom);

  const onWithdraw = useCallback(async (myValidator: MyValidator) => {
    invariant(
      account,
      "Extension is not connected or you don't have an account"
    );
    invariant(gasPrice, "Gas price loading is still pending");
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
        gasLimit: GAS_LIMIT,
      },
      account: account!,
    });
  }, []);

  const dispatchWithdrawalTransactions = async (
    tx: TransactionPair<WithdrawMsgValue>
  ): Promise<void> => {
    broadcastTx(
      tx.encodedTxData.encodedTx,
      tx.signedTx,
      tx.encodedTxData.meta?.props,
      "Withdraw"
    );
  };

  const dispatchPendingNotification = (
    transaction: TransactionPair<WithdrawMsgValue>
  ): void => {
    dispatchNotification({
      id: transaction.encodedTxData.encodedTx.hash(),
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
        myValidator.withdrawableAmount?.eq(0) ||
        isPending ||
        isSuccess ||
        !gasPrice
      }
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {!isSuccess && !isPending && "Withdraw"}
    </ActionButton>
  );
};

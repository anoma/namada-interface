import { ActionButton } from "@namada/components";
import { BondMsgValue, WithdrawMsgValue } from "@namada/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { ToastErrorDescription } from "App/Common/ToastErrorDescription";
import { defaultAccountAtom } from "atoms/accounts";
import { gasLimitsAtom } from "atoms/fees";
import { dispatchToastNotificationAtom } from "atoms/notifications";
import { createWithdrawTxAtomFamily } from "atoms/staking";
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
  const change = {
    validatorId: myValidator.validator.address,
    amount: myValidator.withdrawableAmount!,
  };

  const { gasPrice } = useGasEstimate();
  const gasLimits = useAtomValue(gasLimitsAtom);
  const { data: account } = useAtomValue(defaultAccountAtom);
  const withdrawFamilyId = `${change.validatorId}- ${change.amount}`;

  const {
    mutate: createWithdrawTx,
    data: withdrawalTx,
    isPending,
    isSuccess,
    isError,
    error: withdrawalTransactionError,
  } = useAtomValue(createWithdrawTxAtomFamily(withdrawFamilyId));

  useEffect(() => {
    return () => {
      // On detach we have to remove the param to avoid memory leaks
      createWithdrawTxAtomFamily.remove(withdrawFamilyId);
    };
  }, []);

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
        changes: [change],
        gasConfig: {
          gasPrice: gasPrice!,
          gasLimit: gasLimits.data!.Withdraw.native,
        },
        account: account!,
      });
    },
    [myValidator.withdrawableAmount, gasPrice, gasLimits.isSuccess]
  );

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

  const dispatchWithdrawalTransactions = async (
    tx: TransactionPair<WithdrawMsgValue>
  ): Promise<void> => {
    tx.signedTxs.forEach((signedTx) => {
      broadcastTx(
        tx.encodedTxData,
        signedTx,
        tx.encodedTxData.meta?.props,
        "Withdraw"
      );
    });
  };

  const dispatchPendingNotification = (
    transaction: TransactionPair<WithdrawMsgValue>,
    props: BondMsgValue
  ): void => {
    transaction.encodedTxData.txs.forEach((tx) => {
      dispatchNotification({
        id: tx.tx_hash(),
        title: "Withdrawal transaction in progress",
        description: (
          <>
            The withdrawal of{" "}
            <NamCurrency amount={props.amount || new BigNumber(0)} /> is being
            processed
          </>
        ),
        type: "pending",
      });
    });
  };

  useEffect(() => {
    if (withdrawalTx) {
      const [tx, props] = withdrawalTx;
      dispatchPendingNotification(tx, props);
      dispatchWithdrawalTransactions(tx);
    }
  }, [isSuccess]);

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

  return (
    <ActionButton
      size="xs"
      outlineColor="white"
      borderRadius="sm"
      disabled={!myValidator.withdrawableAmount || isPending || isSuccess}
      onClick={() => onWithdraw(myValidator)}
    >
      {isSuccess && "Claimed"}
      {isPending && "Processing"}
      {!isSuccess && !isPending && "Withdraw"}
    </ActionButton>
  );
};

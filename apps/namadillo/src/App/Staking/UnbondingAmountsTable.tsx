import { StyledTable, TableRow } from "@namada/components";
import { BondMsgValue, WithdrawMsgValue } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { NamCurrency } from "App/Common/NamCurrency";
import { myUnbondsAtom } from "atoms/validators";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { TransactionPair, broadcastTx } from "lib/query";
import { useEffect, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { ValidatorCard } from "./ValidatorCard";
import { WithdrawalButton } from "./WithdrawalButton";

export const UnbondingAmountsTable = (): JSX.Element => {
  const myUnbonds = useAtomValue(myUnbondsAtom);
  const headers = [
    "Validator",
    "Address",
    { children: "Amount Unbonding", className: "text-right" },
    { children: "Time left", className: "text-right" },
  ];

  const rows = useMemo(() => {
    if (!myUnbonds.isSuccess) return [];

    const rowsList: TableRow[] = [];
    for (const myValidator of myUnbonds.data) {
      const { validator, unbondedAmount, withdrawableAmount } = myValidator;

      const amount = new BigNumber(unbondedAmount || withdrawableAmount || 0);

      if (amount.gt(0)) {
        rowsList.push({
          cells: [
            <ValidatorCard
              key={`unbonding-list-${validator.address}`}
              validator={validator}
              showAddress={false}
            />,
            shortenAddress(validator.address, 8, 6),
            <div
              key={`my-validator-currency-${validator.address}`}
              className="text-right leading-tight"
            >
              <NamCurrency amount={amount || new BigNumber(0)} />
            </div>,
            <div
              key={`comission-${validator.address}`}
              className="text-right leading-tight text-sm"
            >
              {myValidator.timeLeft}
            </div>,
            <div
              key={`withdraw-${validator.address}`}
              className="ml-4 relative z-0"
            >
              <WithdrawalButton myValidator={myValidator} />
            </div>,
          ],
        });
      }
    }
    return rowsList;
  }, [myUnbonds]);

  const {
    data: withdrawalTxs,
    isSuccess,
    isError,
    error: withdrawalTransactionError,
  } = useAtomValue(createWithdrawTxAtom);

  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);

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

  const dispatchPendingNotification = (
    transaction: TransactionPair<WithdrawMsgValue>,
    props: BondMsgValue
  ): void => {
    dispatchNotification({
      id: transaction.encodedTxData.tx.tx_hash(),
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
  };

  useEffect(() => {
    if (withdrawalTxs) {
      for (const [tx, props] of withdrawalTxs) {
        dispatchPendingNotification(tx, props);
        dispatchWithdrawalTransactions(tx);
      }
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
    <AtomErrorBoundary
      result={myUnbonds}
      niceError="Unable to load unbonding list"
    >
      <StyledTable
        id="unbonding-amounts-table"
        headers={headers.concat("")}
        rows={rows}
        containerClassName="table-container flex-1 dark-scrollbar overscroll-contain"
        tableProps={{
          className: twMerge(
            "w-full flex-1 [&_td]:px-1 [&_th]:px-1 [&_td]:h-[64px] [&_tr]:relative",
            "[&_td:first-child]:pl-4 [&_td:last-child]:pr-4",
            "[&_td]:font-normal [&_th:first-child]:pl-4 [&_th:last-child]:pr-4",
            "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md",
            "[&_td:first-child]:before:absolute [&_td:first-child]:before:w-full [&_td:first-child]:before:h-full",
            "[&_td:first-child]:before:border [&_td:first-child]:before:border-pink",
            "[&_td:first-child]:before:left-0 [&_td:first-child]:before:top-0",
            "[&_td:first-child]:before:rounded-sm [&_td:first-child]:before:pointer-events-none"
          ),
        }}
        headProps={{ className: "text-neutral-500" }}
      />
    </AtomErrorBoundary>
  );
};

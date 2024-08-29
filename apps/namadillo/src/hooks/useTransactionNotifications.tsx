import { Stack } from "@namada/components";
import { RedelegateMsgValue, TxProps } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "atoms/notifications";
import BigNumber from "bignumber.js";
import { useSetAtom } from "jotai";
import { useTransactionEventListener } from "utils";

type TxWithAmount = { amount: BigNumber };

type AmountByValidator = { amount: BigNumber; validator: string };

const getTotalAmountFromTransactionList = (txs: TxWithAmount[]): BigNumber =>
  txs.reduce((prev: BigNumber, current: TxWithAmount) => {
    return prev.plus(current.amount);
  }, new BigNumber(0));

const parseTxsData = <T extends TxWithAmount>(
  tx: TxProps,
  data: T[]
): { id: string; total: BigNumber } => {
  const id = createNotificationId(tx);
  const total = getTotalAmountFromTransactionList(data);
  return { total, id };
};

const getAmountByValidatorList = <T extends AmountByValidator>(
  data: T[]
): React.ReactNode => {
  return (
    <Stack as="ul" gap={1}>
      {data.map((entry, idx) => {
        return (
          <li className="flex justify-between" key={idx}>
            <span>{shortenAddress(entry.validator, 8, 8)}</span>
            <NamCurrency amount={entry.amount} />
          </li>
        );
      })}
    </Stack>
  );
};

const getReDelegateDetailList = (
  data: RedelegateMsgValue[]
): React.ReactNode => {
  return (
    <Stack as="ul" gap={1}>
      {data.map((entry, idx) => (
        <li
          className="grid grid-cols-[auto_auto] gap-x-2 justify-between"
          key={idx}
        >
          <NamCurrency amount={entry.amount} /> from
          {shortenAddress(entry.sourceValidator, 6, 8)} to{" "}
          {shortenAddress(entry.destinationValidator, 6, 8)}
        </li>
      ))}
    </Stack>
  );
};

export const useTransactionNotifications = (): void => {
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const filterNotifications = useSetAtom(filterToastNotificationsAtom);

  const clearPendingNotifications = (id: string): void => {
    filterNotifications((notification) => notification.id !== id);
  };

  useTransactionEventListener("Bond.Error", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      type: "error",
      title: "Staking transaction failed",
      description: (
        <>
          Your staking transaction of <NamCurrency amount={total} /> has failed
        </>
      ),
      details: e.detail.error?.message,
    });
  });

  useTransactionEventListener("Bond.Success", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Staking transaction succeeded",
      description: (
        <>
          Your staking transaction of <NamCurrency amount={total} /> has
          succeeded
        </>
      ),
      details: getAmountByValidatorList(e.detail.data),
      type: "success",
    });
  });

  useTransactionEventListener("Unbond.Success", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Unstake transaction succeeded",
      description: (
        <>
          You&apos;ve unbonded <NamCurrency amount={total} />
        </>
      ),
      details: getAmountByValidatorList(e.detail.data),
      type: "success",
    });
  });

  useTransactionEventListener("Unbond.Error", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Unstake transaction failed",
      type: "error",
      description: (
        <>
          Your request to unstake <NamCurrency amount={total} /> has failed
        </>
      ),
      details: e.detail.error?.message,
    });
  });

  useTransactionEventListener("Withdraw.Success", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Withdrawal Success",
      description: `Your withdrawal transaction has succeeded`,
      type: "success",
    });
  });

  useTransactionEventListener("Withdraw.Error", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Withdrawal Error",
      description: <>Your withdrawal transaction has failed</>,
      details: e.detail.error?.message,
      type: "error",
    });
  });

  useTransactionEventListener("ReDelegate.Error", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Redelegate failed",
      description: (
        <>
          Your redelegate transaction of <NamCurrency amount={total} />
          has failed
        </>
      ),
      type: "error",
    });
  });

  useTransactionEventListener("ReDelegate.Success", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Redelegate succeeded",
      description: (
        <>
          Your redelegate transaction of <NamCurrency amount={total} />
          has succeeded
        </>
      ),
      details: getReDelegateDetailList(e.detail.data),
      type: "success",
    });
  });

  useTransactionEventListener("VoteProposal.Error", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      type: "error",
      title: "Staking transaction failed",
      description: <>Your vote transaction has failed.</>,
      details: e.detail.error?.message,
    });
  });

  useTransactionEventListener("VoteProposal.Success", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Staking transaction succeeded",
      description: `Your vote transaction has succeeded`,
      type: "success",
    });
  });
};

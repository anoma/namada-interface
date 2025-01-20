import { Stack } from "@namada/components";
import { RedelegateMsgValue, TxProps } from "@namada/types";
import { mapUndefined, shortenAddress } from "@namada/utils";
import { NamCurrency } from "App/Common/NamCurrency";
import { TokenCurrency } from "App/Common/TokenCurrency";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
  filterToastNotificationsAtom,
} from "atoms/notifications";
import { searchAllStoredTxByHash } from "atoms/transactions";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { useSetAtom } from "jotai";
import { EventData } from "types/events";
import { useTransactionEventListener } from "utils";

type TxWithAmount = { amount: BigNumber };

type AmountByValidator = { amount: BigNumber; validator: string };

const getTotalAmountFromTransactionList = (txs: TxWithAmount[]): BigNumber =>
  txs.reduce((prev: BigNumber, current: TxWithAmount) => {
    return prev.plus(current.amount);
  }, new BigNumber(0));

const parseTxsData = <T extends TxWithAmount>(
  tx: TxProps | TxProps[],
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

const partialSuccessDetails = (detail: {
  details: React.ReactNode;
  failedDescription: React.ReactNode;
  failedDetails: React.ReactNode;
}): React.ReactNode => {
  return (
    <>
      <div className="w-full text-xs text-white block">
        <div className="my-2">{detail.details}</div>
        <div className="font-bold my-2">{detail.failedDescription}</div>
        <div>{detail.failedDetails}</div>
      </div>
    </>
  );
};

const failureDetails = (failedDetails: React.ReactNode): React.ReactNode => {
  return (
    <>
      <div className="w-full text-xs text-white block my-2">
        <div>{failedDetails}</div>
      </div>
    </>
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
      details:
        e.detail.failedData ?
          failureDetails(getAmountByValidatorList(e.detail.failedData))
        : e.detail.error?.message,
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

  useTransactionEventListener("Bond.PartialSuccess", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.successData!);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Some staking transactions failed",
      description: (
        <>
          Your staking transaction of <NamCurrency amount={total} /> has
          succeeded
        </>
      ),
      details: partialSuccessDetails({
        details: getAmountByValidatorList(e.detail.successData!),
        failedDescription: (
          <>The following staking transactions were not applied:</>
        ),
        failedDetails: getAmountByValidatorList(e.detail.failedData!),
      }),
      type: "partialSuccess",
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

  useTransactionEventListener("Unbond.PartialSuccess", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.successData!);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Some Unstake transactions failed",
      description: (
        <>
          Your unstaking of <NamCurrency amount={total} /> has succeeded
        </>
      ),
      details: partialSuccessDetails({
        details: getAmountByValidatorList(e.detail.successData!),
        failedDescription: (
          <>The following unstaking transactions were not applied:</>
        ),
        failedDetails: getAmountByValidatorList(e.detail.failedData!),
      }),
      type: "partialSuccess",
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
      details:
        e.detail.failedData ?
          failureDetails(getAmountByValidatorList(e.detail.failedData))
        : e.detail.error?.message,
    });
  });

  useTransactionEventListener("Withdraw.Success", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Withdrawal Success",
      description: <>Your withdrawal transaction has succeeded</>,
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

  useTransactionEventListener("Redelegate.Error", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.data);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Redelegate failed",
      description: (
        <>
          Your redelegate transaction of <NamCurrency amount={total} /> has
          failed
        </>
      ),
      details:
        e.detail.failedData ?
          failureDetails(getReDelegateDetailList(e.detail.failedData))
        : e.detail.error?.message,
      type: "error",
    });
  });

  useTransactionEventListener("Redelegate.Success", (e) => {
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

  useTransactionEventListener("Redelegate.PartialSuccess", (e) => {
    const { id, total } = parseTxsData(e.detail.tx, e.detail.successData!);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Some redelegations were not successful",
      description: (
        <>
          Your redelegate transaction of <NamCurrency amount={total} />
          has succeeded
        </>
      ),
      details: partialSuccessDetails({
        details: getReDelegateDetailList(e.detail.successData!),
        failedDescription: <>The following redelegations were not applied:</>,
        failedDetails: getReDelegateDetailList(e.detail.failedData!),
      }),
      type: "partialSuccess",
    });
  });

  useTransactionEventListener("ClaimRewards.Success", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Claim Rewards",
      description: `Your rewards have been successfully claimed and are now available for staking.`,
      type: "success",
    });
  });

  useTransactionEventListener("ClaimRewards.Error", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Claim Rewards",
      description: `An error occurred while trying to claim your rewards.`,
      type: "error",
      details: mapUndefined(failureDetails, e.detail.error?.message),
    });
  });

  useTransactionEventListener("VoteProposal.Error", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      type: "error",
      title: "Governance transaction failed",
      description: <>Your governance transaction has failed.</>,
      details: e.detail.error?.message,
    });
  });

  useTransactionEventListener("VoteProposal.Success", (e) => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    dispatchNotification({
      id,
      title: "Governance transaction succeeded",
      description: `Your governance transaction has succeeded`,
      type: "success",
    });
  });

  const onTransferError = (e: EventData<unknown>): void => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    const storedTx = searchAllStoredTxByHash(e.detail.tx[0].hash);
    dispatchNotification({
      id,
      type: "error",
      title: "Transfer transaction failed",
      description:
        storedTx ?
          <>
            Your transfer transaction of{" "}
            <TokenCurrency
              symbol={storedTx.asset.symbol}
              amount={storedTx.displayAmount}
            />{" "}
            to {shortenAddress(storedTx.destinationAddress, 8, 8)} has failed
          </>
        : "Your transfer transaction has failed",
      details:
        e.detail.error?.message && failureDetails(e.detail.error.message),
    });
  };
  useTransactionEventListener("TransparentTransfer.Error", onTransferError);
  useTransactionEventListener("ShieldedTransfer.Error", onTransferError);
  useTransactionEventListener("ShieldingTransfer.Error", onTransferError);
  useTransactionEventListener("UnshieldingTransfer.Error", onTransferError);

  const onTransferSuccess = (e: EventData<unknown>): void => {
    const id = createNotificationId(e.detail.tx);
    clearPendingNotifications(id);
    const storedTx = searchAllStoredTxByHash(e.detail.tx[0].hash);
    dispatchNotification({
      id,
      title: "Transfer transaction succeeded",
      description:
        storedTx ?
          <>
            Your transfer transaction of{" "}
            <TokenCurrency
              symbol={storedTx.asset.symbol}
              amount={storedTx.displayAmount}
            />{" "}
            to {shortenAddress(storedTx.destinationAddress, 8, 8)} has succeeded
          </>
        : "Your transfer transaction has succeeded",
      type: "success",
    });
  };
  useTransactionEventListener("TransparentTransfer.Success", onTransferSuccess);
  useTransactionEventListener("ShieldedTransfer.Success", onTransferSuccess);
  useTransactionEventListener("ShieldingTransfer.Success", onTransferSuccess);
  useTransactionEventListener("UnshieldingTransfer.Success", onTransferSuccess);

  useTransactionEventListener("IbcTransfer.Success", (e) => {
    invariant(e.detail.hash, "Notification error: Invalid Tx hash");
    const id = createNotificationId(e.detail.hash);
    clearPendingNotifications(id);

    const title =
      e.detail.type === "TransparentToIbc" ?
        "IBC withdraw transaction succeeded"
      : "IBC transfer transaction succeeded";

    dispatchNotification({
      id,
      title,
      description: (
        <>
          Your transaction of{" "}
          <TokenCurrency
            amount={e.detail.displayAmount}
            symbol={e.detail.asset.symbol}
          />{" "}
          has completed
        </>
      ),
      type: "success",
    });
  });

  useTransactionEventListener("IbcTransfer.Error", (e) => {
    invariant(e.detail.hash, "Notification error: Invalid Tx provider");
    const id = createNotificationId(e.detail.hash);
    clearPendingNotifications(id);

    const title =
      e.detail.type === "TransparentToIbc" ?
        "IBC withdraw transaction failed"
      : "IBC transfer transaction failed";

    dispatchNotification({
      id,
      title,
      description: (
        <>
          Your transaction of{" "}
          <TokenCurrency
            amount={e.detail.displayAmount}
            symbol={e.detail.asset.symbol}
          />{" "}
          has failed.
        </>
      ),
      details: e.detail.errorMessage,
      type: "error",
    });
  });
};

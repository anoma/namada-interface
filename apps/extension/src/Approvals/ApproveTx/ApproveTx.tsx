import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { TxType, TxTypeLabel } from "@namada/shared";
import { AccountType, Tokens } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { RejectTxMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  setDetails: (details: ApprovalDetails) => void;
};

export const ApproveTx: React.FC<Props> = ({ setDetails }) => {
  const navigate = useNavigate();
  const requester = useRequester();

  const params = useSanitizedParams();
  const txType = parseInt(params?.type || "0");

  const query = useQuery();
  const {
    accountType,
    msgId,
    amount,
    source,
    target,
    validator,
    tokenAddress,
    publicKey,
    nativeToken,
  } = query.getAll();

  const tokenType =
    Object.values(Tokens).find((token) => token.address === tokenAddress)
      ?.symbol || "NAM";

  useEffect(() => {
    if (source && txType && msgId) {
      setDetails({
        source,
        txType,
        msgId,
        publicKey,
        target,
        nativeToken,
      });
    }
  }, [source, publicKey, txType, target, msgId]);

  const handleApproveClick = useCallback((): void => {
    if (accountType === AccountType.Ledger) {
      return navigate(`${TopLevelRoute.ConfirmLedgerTx}`);
    }
    navigate(TopLevelRoute.ConfirmTx);
  }, [accountType]);

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      if (msgId) {
        await requester.sendMessage(Ports.Background, new RejectTxMsg(msgId));
        // Close tab
        return await closeCurrentTab();
      }
      throw new Error("msgId was not provided!");
    } catch (e) {
      console.warn(e);
    }
    return;
  }, [msgId]);

  return (
    <Stack className="text-white" gap={4}>
      <Alert type="warning">
        Approve this {accountType === AccountType.Ledger ? "Ledger " : ""}
        <strong>{TxTypeLabel[txType as TxType]}</strong> transaction?
      </Alert>
      <Stack gap={2}>
        {source && (
          <p className="text-xs">
            Source: <strong>{shortenAddress(source)}</strong>
          </p>
        )}
        {target && (
          <p className="text-xs">
            Target:
            <strong>{shortenAddress(target)}</strong>
          </p>
        )}
        {amount && (
          <p className="text-xs">
            Amount: {amount} {tokenType}
          </p>
        )}
        {validator && (
          <p className="text-xs">Validator: {shortenAddress(validator)}</p>
        )}
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
        <ActionButton onClick={handleReject}>Reject</ActionButton>
      </Stack>
    </Stack>
  );
};

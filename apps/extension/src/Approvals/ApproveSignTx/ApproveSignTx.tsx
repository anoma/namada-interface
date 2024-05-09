import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Stack } from "@namada/components";
import { AccountType } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { RejectSignTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ApproveSignTx: React.FC<Props> = ({ details }) => {
  const navigate = useNavigate();
  const requester = useRequester();

  const { accountType, msgId, signer } = details || {};

  const handleApproveClick = useCallback((): void => {
    if (accountType === AccountType.Ledger) {
      return navigate(`${TopLevelRoute.ConfirmLedgerTx}`);
    }
    navigate(TopLevelRoute.ConfirmSignTx);
  }, [accountType]);

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      if (msgId) {
        await requester.sendMessage(
          Ports.Background,
          new RejectSignTxMsg(msgId)
        );
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
        Sign this {accountType === AccountType.Ledger ? "Ledger " : ""}
        transaction?
      </Alert>
      <Stack gap={2}>
        <div>
          {signer && (
            <p className="text-xs">
              Signer: <strong>{shortenAddress(signer)}</strong>
            </p>
          )}
        </div>
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
        <ActionButton onClick={handleReject}>Reject</ActionButton>
      </Stack>
    </Stack>
  );
};

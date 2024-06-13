import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { AccountType } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { RejectSignTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  setDetails: (details: ApprovalDetails) => void;
};

export const ApproveSignTx: React.FC<Props> = ({ setDetails }) => {
  const navigate = useNavigate();
  const requester = useRequester();
  const params = useSanitizedParams();
  const accountType =
    (params?.accountType as AccountType) || AccountType.PrivateKey;
  const msgId = params?.msgId || "0";
  const signer = params?.signer;
  const signType = params?.signType;

  useEffect(() => {
    if (signer && msgId && signType) {
      setDetails({
        msgId,
        signer,
        accountType,
        signType,
      });
    }
  }, []);

  const handleApproveSubmit = useCallback(
    (e: React.FormEvent): void => {
      e.preventDefault();
      if (accountType === AccountType.Ledger) {
        return navigate(`${TopLevelRoute.ConfirmLedgerTx}`);
      }
      navigate(TopLevelRoute.ConfirmSignTx);
    },
    [accountType]
  );

  const handleReject = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
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
    },
    [msgId]
  );

  return (
    <Stack className="text-white" gap={4}>
      <Alert type="warning">
        Sign this {accountType === AccountType.Ledger ? "Ledger " : ""}
        transaction?
      </Alert>
      <Stack gap={2} as="form" onSubmit={handleApproveSubmit}>
        <div>
          {signer && (
            <p className="text-xs">
              Signer: <strong>{shortenAddress(signer)}</strong>
            </p>
          )}
        </div>
        <Stack gap={3} direction="horizontal">
          <ActionButton>Approve</ActionButton>
          <ActionButton onClick={handleReject}>Reject</ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { shortenAddress } from "@namada/utils";
import { SignatureDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { RejectSignatureMsg } from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  setSignatureDetails: (details: SignatureDetails) => void;
};

export const ApproveSignature: React.FC<Props> = ({ setSignatureDetails }) => {
  const navigate = useNavigate();
  const params = useSanitizedParams();
  const requester = useRequester();
  const signer = params?.signer;
  const query = useQuery();
  const { msgId } = query.getAll();

  const handleApproveClick = useCallback((): void => {
    if (signer) {
      setSignatureDetails({ msgId, signer });
      navigate(TopLevelRoute.ConfirmSignature);
    }
  }, [signer]);

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      if (msgId) {
        await requester.sendMessage(
          Ports.Background,
          new RejectSignatureMsg(msgId)
        );
        // Close tab
        return await closeCurrentTab();
      }
      throw new Error("msgId was not provided!");
    } catch (e) {
      console.warn(e);
    }
  }, []);

  return (
    <Stack className="text-white" gap={4}>
      {signer && (
        <Alert type="warning">
          Approve this signature request for account{" "}
          {shortenAddress(signer, 24)}?
        </Alert>
      )}
      <Stack gap={2}>
        {signer && (
          <p className="text-xs">
            Signer: <strong>{shortenAddress(signer)}</strong>
          </p>
        )}
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
        <ActionButton onClick={handleReject}>Reject</ActionButton>
      </Stack>
    </Stack>
  );
};

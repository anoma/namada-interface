import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, GapPatterns, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { shortenAddress } from "@namada/utils";
import { PageHeader } from "App/Common";
import { SignArbitraryDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import {
  QuerySignArbitraryDataMsg,
  RejectSignArbitraryMsg,
} from "background/approvals";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  setSignArbitraryDetails: (details: SignArbitraryDetails) => void;
};

export const ApproveSignArbitrary: React.FC<Props> = ({
  setSignArbitraryDetails,
}) => {
  const navigate = useNavigate();
  const params = useSanitizedParams();
  const requester = useRequester();
  const signer = params?.signer;
  const query = useQuery();
  const { msgId } = query.getAll();

  const queryPendingSignArbitraryData = async (
    msgId: string
  ): Promise<string> => {
    const pendingSignAbitrary = await requester.sendMessage(
      Ports.Background,
      new QuerySignArbitraryDataMsg(msgId)
    );
    return pendingSignAbitrary;
  };

  useEffect(() => {
    if (msgId && signer) {
      queryPendingSignArbitraryData(msgId)
        .then((data) => {
          setSignArbitraryDetails({ msgId, signer, data });
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [msgId, signer]);

  const handleApproveClick = useCallback((): void => {
    if (signer) {
      navigate(TopLevelRoute.ConfirmSignArbitrary);
    }
  }, [signer]);

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      if (msgId) {
        await requester.sendMessage(
          Ports.Background,
          new RejectSignArbitraryMsg(msgId)
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
    <Stack full gap={GapPatterns.TitleContent} className="text-white pt-4 pb-8">
      <PageHeader title="Approve Sign Arbitrary Request" />

      {signer && (
        <Alert type="warning">
          Approve this signature request for account{" "}
          {shortenAddress(signer, 24)}?
        </Alert>
      )}
      <Stack full gap={2}>
        {signer && (
          <p className="text-xs">
            Signer: <strong>{shortenAddress(signer)}</strong>
          </p>
        )}
        <ActionButton
          borderRadius="sm"
          onClick={() => navigate(TopLevelRoute.ApproveSignArbitraryDetails)}
        >
          View Data
        </ActionButton>
      </Stack>
      <Stack gap={2}>
        <ActionButton borderRadius="sm" onClick={handleApproveClick}>
          Approve
        </ActionButton>
        <ActionButton
          borderRadius="sm"
          outlineColor="yellow"
          onClick={handleReject}
        >
          Reject
        </ActionButton>
      </Stack>
    </Stack>
  );
};

import { ActionButton, GapPatterns, Stack } from "@namada/components";
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
import { useCallback, useEffect, useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { ApprovalPanelHeader } from "./ApprovalPanelHeader";
import { TransactionCard } from "./TransactionCard";
import { TransactionDataPanel } from "./TransactionDataPanel";

type Props = {
  setSignArbitraryDetails: (details: SignArbitraryDetails) => void;
};

export const ApproveSignArbitrary: React.FC<Props> = ({
  setSignArbitraryDetails,
}) => {
  const [displayTransactionData, setDisplayTransactionData] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const params = useSanitizedParams();
  const requester = useRequester();
  const origin = params.origin!;
  const signer = params.signer!;
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
    if (msgId && signer && origin) {
      queryPendingSignArbitraryData(msgId)
        .then((data) => {
          setMessage(data);
          setSignArbitraryDetails({ msgId, signer, data, origin });
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

  const getDataAsText = (data: string): string => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return raw data
      return data;
    }
  };

  return (
    <Stack full gap={GapPatterns.TitleContent} className="text-white pt-4 pb-6">
      <PageHeader title="Approve Sign Arbitrary Request" />
      <div className="flex flex-col flex-1 gap-4 justify-between">
        <main className="flex-1">
          <ApprovalPanelHeader
            numberOfTransactions={1}
            onChangeViewData={setDisplayTransactionData}
            viewTransactionData={displayTransactionData}
          />
          {message && !displayTransactionData && (
            <TransactionCard
              title="Sign message"
              content={<span className="italic">{message}</span>}
              icon={<AiOutlineMessage />}
            />
          )}
          {message && displayTransactionData && (
            <TransactionDataPanel data={getDataAsText(message)} />
          )}
        </main>
        <Stack gap={2}>
          <p className="text-xs">
            {signer && (
              <>
                Signer: <strong>{shortenAddress(signer)}</strong>
              </>
            )}
            <br />
            Origin: <strong>{origin}</strong>
          </p>
          <Stack gap={2}>
            <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
            <ActionButton
              backgroundHoverColor="black"
              textHoverColor="yellow"
              outlineColor="yellow"
              onClick={handleReject}
            >
              Reject
            </ActionButton>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};

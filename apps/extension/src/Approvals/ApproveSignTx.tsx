import { TxType, TxTypeLabel } from "@heliax/namada-sdk/web";
import { ActionButton, GapPatterns, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { AccountType } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { PageHeader } from "App/Common/PageHeader";
import { ApprovalDetails } from "Approvals/Approvals";
import { Commitment } from "Approvals/Commitment";
import { TransactionDataPanel } from "Approvals/TransactionDataPanel";
import { TopLevelRoute } from "Approvals/types";
import { QueryTxDetailsMsg, RejectSignTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { ApprovalPanelHeader } from "./ApprovalPanelHeader";

type Props = {
  details?: ApprovalDetails;
  setDetails: (details: ApprovalDetails) => void;
};

export const ApproveSignTx: React.FC<Props> = ({ details, setDetails }) => {
  const navigate = useNavigate();
  const requester = useRequester();
  const params = useSanitizedParams();
  const accountType =
    (params?.accountType as AccountType) || AccountType.PrivateKey;
  const msgId = params?.msgId;
  const signer = params?.signer;
  const [displayTransactionData, setDisplayTransactionData] = useState(false);

  useEffect(() => {
    const fetchDetails = async (): Promise<void> => {
      if (signer && msgId) {
        const txDetails = await requester.sendMessage(
          Ports.Background,
          new QueryTxDetailsMsg(msgId)
        );
        setDetails({
          msgId,
          signer,
          accountType,
          txDetails,
        });
      }
    };

    // TODO: Add error state
    fetchDetails().catch((e) => console.error(e));
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

  const getDataAsText = (): string => {
    if (!details) return "";
    return JSON.stringify(
      {
        ...details.txDetails,
        commitments: details.txDetails.commitments.map((cmt) => ({
          ...cmt,
          txType: TxTypeLabel[cmt.txType as TxType],
        })),
      },
      null,
      2
    );
  };

  const numberOfTx = details?.txDetails.commitments.length || 0;
  return (
    <Stack
      className="h-full text-white pt-4 pb-6"
      gap={GapPatterns.TitleContent}
    >
      <PageHeader title="Confirm Transaction" />
      <div className="flex flex-col h-full gap-4 justify-between">
        <main>
          <ApprovalPanelHeader
            numberOfTransactions={numberOfTx}
            onChangeViewData={setDisplayTransactionData}
            viewTransactionData={displayTransactionData}
          />
          {!displayTransactionData &&
            details?.txDetails?.commitments?.length && (
              <Stack gap={1}>
                {details.txDetails.commitments.map((tx, i) => (
                  <Commitment key={i} commitment={tx} />
                ))}
              </Stack>
            )}
          {displayTransactionData && details?.txDetails && (
            <TransactionDataPanel data={getDataAsText()} />
          )}
        </main>
        <Stack gap={2} as="form" onSubmit={handleApproveSubmit}>
          {signer && (
            <p className="text-xs">
              Signer: <strong>{shortenAddress(signer)}</strong>
            </p>
          )}
          <Stack gap={1.5} direction="vertical">
            <ActionButton borderRadius="sm">Approve</ActionButton>
            <ActionButton
              backgroundHoverColor="black"
              textHoverColor="yellow"
              borderRadius="sm"
              onClick={handleReject}
              outlineColor="yellow"
            >
              Reject
            </ActionButton>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};

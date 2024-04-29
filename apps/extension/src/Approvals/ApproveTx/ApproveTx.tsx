import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TxType, TxTypeLabel } from "@heliax/namada-sdk/web";
import { ActionButton, Alert, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import {
  AccountType,
  BondProps,
  RedelegateProps,
  Tokens,
  TransferProps,
  TxMsgProps,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { QueryPendingTxMsg, RejectTxMsg } from "background/approvals";
import { ExtensionRequester } from "extension";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  setDetails: (details: ApprovalDetails) => void;
  details?: ApprovalDetails;
};

const fetchPendingTxDetails = async (
  requester: ExtensionRequester,
  msgId: string
): Promise<TxMsgProps> => {
  return await requester.sendMessage(
    Ports.Background,
    new QueryPendingTxMsg(msgId)
  );
};

export const ApproveTx: React.FC<Props> = ({ details, setDetails }) => {
  const navigate = useNavigate();
  const requester = useRequester();
  // Parse URL params
  const params = useSanitizedParams();
  const txType = parseInt(params?.type || "0");
  const accountType =
    (params?.accountType as AccountType) || AccountType.PrivateKey;
  const msgId = params?.msgId || "0";

  useEffect(() => {
    fetchPendingTxDetails(requester, msgId)
      .then((details) => {
        if (!details) {
          throw new Error(
            `Failed to fetch Tx details - no transactions exists for ${msgId}`
          );
        }
        // TODO: Handle array of approval details
        setDetails({
          txType,
          msgId,
          tx: details,
        });
      })
      .catch((e) => {
        console.error(`Could not fetch pending Tx with msgId = ${msgId}: ${e}`);
      });
  }, [txType, msgId]);

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
        {details?.tx.txProps.map((txDetails, i) => {
          // Destructure possible details to display
          // TODO: This should be improved!
          const {
            amount,
            source,
            target,
            token: tokenAddress,
          } = (txDetails as TransferProps) || {};
          const { publicKey } = details.tx.wrapperTxProps;
          const { validator } = (txDetails as BondProps) || {};
          const { sourceValidator, destinationValidator } =
            (txDetails as RedelegateProps) || {};

          const tokenType =
            Object.values(Tokens).find(
              (token) => token.address === tokenAddress
            )?.symbol || "NAM";

          return (
            <div key={i}>
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
              {publicKey && (
                <p className="text-xs">
                  Public key: {shortenAddress(publicKey)}
                </p>
              )}
              {validator && (
                <p className="text-xs">
                  Validator: {shortenAddress(validator)}
                </p>
              )}
              {sourceValidator && (
                <p className="text-xs">
                  Source Validator: {shortenAddress(sourceValidator)}
                </p>
              )}
              {destinationValidator && (
                <p className="text-xs">
                  Destination Validator: {shortenAddress(destinationValidator)}
                </p>
              )}
            </div>
          );
        })}
      </Stack>
      <Stack gap={3} direction="horizontal">
        <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
        <ActionButton onClick={handleReject}>Reject</ActionButton>
      </Stack>
    </Stack>
  );
};

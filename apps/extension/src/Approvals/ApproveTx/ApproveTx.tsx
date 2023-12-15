import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ActionButton, Alert, Stack, Text } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { TxType, TxTypeLabel } from "@namada/shared";
import { AccountType, Tokens } from "@namada/types";
import { shortenAddress } from "@namada/utils";

import { Address } from "App/Accounts/AccountListing.components";
import { ApprovalDetails } from "Approvals/Approvals";
import { ButtonContainer } from "Approvals/Approvals.components";
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
  } = query.getAll();

  const tokenType =
    Object.values(Tokens).find((token) => token.address === tokenAddress)
      ?.symbol || "";

  useEffect(() => {
    if (source && txType && msgId) {
      setDetails({
        source,
        txType,
        msgId,
        publicKey,
        target,
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
    <Stack gap={4}>
      <Alert type="warning">
        Approve this {accountType === AccountType.Ledger ? "Ledger " : ""}
        <strong>{TxTypeLabel[txType as TxType]}</strong> transaction?
      </Alert>
      {source && (
        <Text fontSize="xs">
          Source: <Address>{shortenAddress(source)}</Address>
        </Text>
      )}
      {target && (
        <Text fontSize="xs">
          Target:
          <Address>{shortenAddress(target)}</Address>
        </Text>
      )}
      {amount && (
        <Text fontSize="xs">
          Amount: {amount} {tokenType}
        </Text>
      )}
      {validator && (
        <Text fontSize="xs">Validator: {shortenAddress(validator)}</Text>
      )}

      <ButtonContainer>
        <ActionButton onClick={handleApproveClick}>Approve</ActionButton>
        <ActionButton onClick={handleReject}>Reject</ActionButton>
      </ButtonContainer>
    </Stack>
  );
};

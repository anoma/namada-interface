import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

import { Button, ButtonVariant } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { AccountType, Tokens } from "@namada/types";
import { TxType } from "@namada/shared";

import { useQuery } from "hooks";
import { Address } from "App/Accounts/AccountListing.components";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { TopLevelRoute, TxTypeLabel } from "Approvals/types";
import { Ports } from "router";
import { RejectTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { closeCurrentTab } from "utils";
import { useSanitizedParams } from "@namada/hooks";
import { ApprovalDetails } from "Approvals/Approvals";

type Props = {
  setDetails: (details: ApprovalDetails) => void;
};

export const ApproveTx: React.FC<Props> = ({ setDetails }) => {
  const navigate = useNavigate();
  const requester = useRequester();

  const params = useSanitizedParams();
  const txType = parseInt(params?.type || "0");

  const query = useQuery();
  const accountType = query.get("accountType") || "";
  const msgId = query.get("id") || "";
  const amount = query.get("amount") || "";
  const source = query.get("source") || "";
  const target = query.get("target") || "";
  const tokenAddress = query.get("token") || "";
  const tokenType =
    Object.values(Tokens).find((token) => token.address === tokenAddress)
      ?.symbol || "";
  const publicKey = query.get("publicKey") || "";

  useEffect(() => {
    setDetails({
      source,
      txType,
      msgId,
      publicKey,
      target,
    });
  }, [source, publicKey, txType, target, msgId]);

  const handleApproveClick = (): void => {
    if (accountType === AccountType.Ledger) {
      return navigate(`${TopLevelRoute.ConfirmLedgerTx}`);
    }
    navigate(TopLevelRoute.ConfirmTx);
  };

  const handleReject = useCallback(async (): Promise<void> => {
    try {
      // TODO: use executeUntil here!
      await requester.sendMessage(Ports.Background, new RejectTxMsg(msgId));

      // Close tab
      await closeCurrentTab();
    } catch (e) {
      console.warn(e);
    }
    return;
  }, [msgId]);

  return (
    <ApprovalContainer>
      <p>
        Approve this <strong>{TxTypeLabel[txType as TxType]}</strong>{" "}
        transaction?
      </p>
      <p>Source:&nbsp;</p>
      <Address>{shortenAddress(source)}</Address>
      {target && (
        <>
          <p>Target:&nbsp;</p>
          <Address>{shortenAddress(target)}</Address>
        </>
      )}
      <p>
        Amount: {amount} {tokenType}
      </p>
      <ButtonContainer>
        <Button onClick={handleApproveClick} variant={ButtonVariant.Contained}>
          Approve
        </Button>
        <Button onClick={handleReject} variant={ButtonVariant.Contained}>
          Reject
        </Button>
      </ButtonContainer>
    </ApprovalContainer>
  );
};

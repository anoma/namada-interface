import { useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";

import { Button, ButtonVariant } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { AccountType, Tokens } from "@namada/types";
import { TxType } from "@namada/shared";
import { useSanitizedParams } from "@namada/hooks";

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
    <ApprovalContainer>
      <p>
        Approve this <strong>{TxTypeLabel[txType as TxType]}</strong>{" "}
        transaction?
      </p>
      {source && (
        <>
          <p>Source:&nbsp;</p>
          <Address>{shortenAddress(source)}</Address>
        </>
      )}
      {target && (
        <>
          <p>Target:&nbsp;</p>
          <Address>{shortenAddress(target)}</Address>
        </>
      )}
      {amount && (
        <p>
          Amount: {amount} {tokenType}
        </p>
      )}
      {validator && <p>Validator: {shortenAddress(validator)}</p>}
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

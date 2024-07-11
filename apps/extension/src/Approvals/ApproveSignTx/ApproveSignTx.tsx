import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TxType } from "@heliax/namada-sdk/web";
import { ActionButton, Alert, Stack } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import {
  AccountType,
  BondProps,
  RevealPkProps,
  TransparentTransferProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { ApprovalDetails } from "Approvals/Approvals";
import { TopLevelRoute } from "Approvals/types";
import { QueryTxDetailsMsg, RejectSignTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

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

  return (
    <Stack className="text-white" gap={4}>
      <div>
        {/* TODO: Use an icon: */}
        <ActionButton
          onClick={() => navigate(TopLevelRoute.ApproveSignTxDetails)}
        >
          View Data
        </ActionButton>
      </div>
      <Alert type="warning">
        Sign this {accountType === AccountType.Ledger ? "Ledger " : ""}
        transaction?
      </Alert>
      {details?.txDetails?.commitments &&
        details.txDetails.commitments.length > 0 && (
          <Stack gap={1}>
            {details.txDetails.commitments.map((tx, i) => {
              switch (tx.txType) {
                case TxType.RevealPK:
                  const revealPk = tx as RevealPkProps;
                  return <div key={i}>RevealPK: {revealPk.publicKey}</div>;
                case TxType.Bond:
                  const bond = tx as BondProps;
                  return (
                    <div key={i}>
                      Bond: {bond.validator} {bond.amount}
                    </div>
                  );
                case TxType.Unbond:
                  const unbond = tx as UnbondProps;
                  return (
                    <div key={i}>
                      Unbond: {unbond.validator} {unbond.amount}
                    </div>
                  );
                case TxType.VoteProposal:
                  const voteProposal = tx as VoteProposalProps;
                  return (
                    <div key={i}>
                      Vote: {voteProposal.vote} {voteProposal.proposalId}
                    </div>
                  );
                case TxType.Withdraw:
                  const withdraw = tx as WithdrawProps;
                  return <div key={i}>Withdraw: {withdraw.validator}</div>;
                case TxType.TransparentTransfer:
                  const transfer = tx as TransparentTransferProps;
                  return (
                    <div key={i}>
                      Transparent Transfer: {transfer.target} {transfer.amount}
                    </div>
                  );
              }
            })}
          </Stack>
        )}
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

import clsx from "clsx";
import { ReactNode, useCallback, useEffect, useState } from "react";

import { Ledger, makeBip44Path } from "@heliaxdev/namada-sdk/web";
import { ActionButton, Stack } from "@namada/components";
import { LedgerError, ResponseSign } from "@zondax/ledger-namada";

import { fromBase64 } from "@cosmjs/encoding";
import { chains } from "@namada/chains";
import { PageHeader } from "App/Common";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  QueryPendingTxBytesMsg,
  SubmitApprovedSignLedgerTxMsg,
} from "background/approvals";
import { QueryAccountDetailsMsg } from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { ApproveIcon } from "./ApproveIcon";
import { LedgerIcon } from "./LedgerIcon";
import { StatusBox } from "./StatusBox";

type Props = {
  details: ApprovalDetails;
};

const Step: React.FC<{
  title: string;
  description: string;
  icon: ReactNode;
  selected: boolean;
  disabled?: boolean;
}> = ({ title, description, icon, selected, disabled }) => {
  return (
    <div
      className={clsx(
        "text-white p-4",
        selected ? "border border-yellow rounded-md" : "",
        disabled ? "opacity-25" : ""
      )}
    >
      <div className="flex items-center gap-4">
        <div className="bg-black w-20 h-20 rounded-md flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-yellow text-base uppercase font-semibold">
            {title}
          </div>
          <div className="text-sm font-medium">{description}</div>
        </div>
      </div>
    </div>
  );
};

export const ConfirmSignLedgerTx: React.FC<Props> = ({ details }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const [isLedgerConnected, setIsLedgerConnected] = useState(false);
  const { msgId, signer } = details;

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status]);

  const signLedgerTx = async (
    ledger: Ledger,
    bytes: Uint8Array,
    path: string
  ): Promise<ResponseSign> => {
    // Open ledger transport
    setStatusInfo(`Review and approve transaction on your Ledger`);

    // Sign with Ledger
    const signature = await ledger.sign(bytes, path);
    const { errorMessage, returnCode } = signature;

    if (returnCode !== LedgerError.NoErrors) {
      throw new Error(`Signing error encountered: ${errorMessage}`);
    }
    return signature;
  };

  const handleApproveLedgerSignTx = useCallback(
    async (e: React.FormEvent): Promise<void> => {
      e.preventDefault();
      setIsLedgerConnected(false);
      setStatusInfo(`Connecting Ledger...`);
      setStatus(Status.Pending);

      const ledger = await Ledger.init().catch((e) => {
        setError(`${e}`);
        setStatus(Status.Failed);
      });

      if (!ledger) {
        return;
      }

      const {
        version: { returnCode, errorMessage },
      } = await ledger.status();

      // Validate Ledger state first
      if (returnCode !== LedgerError.NoErrors) {
        await ledger.closeTransport();
        setError(errorMessage);
        setStatus(Status.Failed);
      }

      setIsLedgerConnected(true);
      setStatusInfo("Preparing transaction...");

      try {
        const accountDetails = await requester.sendMessage(
          Ports.Background,
          new QueryAccountDetailsMsg(signer)
        );
        if (!accountDetails) {
          throw new Error(`Failed to query account details for ${signer}`);
        }
        const path = makeBip44Path(
          chains.namada.bip44.coinType,
          accountDetails.path
        );
        const pendingTxs = await requester.sendMessage(
          Ports.Background,
          new QueryPendingTxBytesMsg(msgId)
        );

        if (!pendingTxs) {
          throw new Error(
            `Pending transactions for msgId: ${msgId} not found!`
          );
        }

        const signatures: ResponseSign[] = [];

        for await (const tx of pendingTxs) {
          const signature = await signLedgerTx(ledger, fromBase64(tx), path);
          signatures.push(signature);
        }

        await requester.sendMessage(
          Ports.Background,
          new SubmitApprovedSignLedgerTxMsg(msgId, signatures)
        );

        setStatus(Status.Completed);
      } catch (e) {
        await ledger.closeTransport();
        setError(`${e}`);
        setStatus(Status.Failed);
        setIsLedgerConnected(false);
      }
    },
    []
  );

  const handleRejectButton = useCallback(() => {
    void closeCurrentTab();
  }, []);

  return (
    <Stack full className="py-4">
      <PageHeader title="Ledger sign" />
      <Stack full as="form" onSubmit={handleApproveLedgerSignTx}>
        <StatusBox status={status} pendingText={statusInfo} errorText={error} />
        <Step
          title="Step 1"
          description='Make sure your Ledger is unlocked, and click "Submit"'
          icon={<LedgerIcon />}
          selected={!isLedgerConnected}
          disabled={isLedgerConnected}
        />
        <Step
          title="Step 2"
          description="Review and approve transaction on your ledger"
          icon={<ApproveIcon />}
          selected={isLedgerConnected}
        />
        <div className="flex-1" />
        <Stack gap={2}>
          <ActionButton disabled={status === Status.Pending}>
            Submit
          </ActionButton>
          <ActionButton
            outlineColor="yellow"
            type="button"
            onClick={handleRejectButton}
          >
            Reject
          </ActionButton>
        </Stack>
      </Stack>
    </Stack>
  );
};

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Alert,
  Input,
  InputVariants,
  Stack,
} from "@namada/components";
import { SupportedTx, TxType, TxTypeLabel } from "@namada/shared";
import { shortenAddress } from "@namada/utils";

import { Address } from "App/Accounts/AccountListing.components";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  ButtonContainer,
  InfoHeader,
  InfoLoader,
} from "Approvals/Approvals.components";
import { SubmitApprovedTxMsg } from "background/approvals";
import { useRequester } from "hooks/useRequester";
import { FetchAndStoreMaspParamsMsg, HasMaspParamsMsg } from "provider";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

const { NAMADA_INTERFACE_NAMADA_FAUCET_ADDRESS: faucetAddress } = process.env;

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmTx: React.FC<Props> = ({ details }) => {
  const { source, msgId, txType, target } = details || {};
  const signerAddress = source === faucetAddress && target ? target : source;

  const navigate = useNavigate();
  const requester = useRequester();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const handleApproveTx = useCallback(async (): Promise<void> => {
    setStatus(Status.Pending);
    setStatusInfo(
      `Decrypting keys and submitting ${TxTypeLabel[txType as TxType]}...`
    );

    try {
      if (!msgId) {
        throw new Error("msgId was not provided!");
      }

      const hasMaspParams = await requester.sendMessage(
        Ports.Background,
        new HasMaspParamsMsg()
      );

      if (!hasMaspParams) {
        setStatusInfo("Fetching MASP parameters...");
        try {
          await requester.sendMessage(
            Ports.Background,
            new FetchAndStoreMaspParamsMsg()
          );
        } catch (e) {
          setError(`Fetching MASP parameters failed: ${e}`);
          setStatus(Status.Failed);
        }
      }

      requester.sendMessage(
        Ports.Background,
        new SubmitApprovedTxMsg(txType as SupportedTx, msgId, password)
      );
      setStatus(Status.Completed);
    } catch (e) {
      console.info(e);
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [password]);

  useEffect(() => {
    if (status === Status.Completed) {
      closeCurrentTab();
    }
  }, [status]);

  return (
    <Stack gap={4}>
      {status === Status.Pending && (
        <Alert type="info">
          <InfoHeader>
            <InfoLoader />
            <p>{statusInfo}</p>
          </InfoHeader>
        </Alert>
      )}
      {status === Status.Failed && (
        <Alert type="error">
          {error}
          <br />
          Try again
        </Alert>
      )}
      {status !== (Status.Pending || Status.Completed) && signerAddress && (
        <>
          <Alert type="warning">
            Decrypt keys for <Address>{shortenAddress(signerAddress)}</Address>
          </Alert>
          <Input
            variant={InputVariants.Password}
            label={"Password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ButtonContainer>
            <ActionButton onClick={handleApproveTx} disabled={!password}>
              Authenticate
            </ActionButton>
            <ActionButton onClick={() => navigate(-1)}>Back</ActionButton>
          </ButtonContainer>
        </>
      )}
    </Stack>
  );
};

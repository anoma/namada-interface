import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { TxType } from "@namada/shared";

import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
  InfoHeader,
  InfoLoader,
} from "Approvals/Approvals.components";
import { Ports } from "router";
import { useRequester } from "hooks/useRequester";
import {
  SubmitApprovedBondMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedUnbondMsg,
} from "background/approvals";
import { Address } from "App/Accounts/AccountListing.components";
import { closeCurrentTab } from "utils";
import { FetchAndStoreMaspParamsMsg, HasMaspParamsMsg } from "provider";
import { TxTypeLabel } from "Approvals/types";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmTx: React.FC<Props> = ({ details }) => {
  const { source = "", msgId = "", txType } = details || {};
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
      switch (txType) {
        case TxType.Bond: {
          await requester.sendMessage(
            Ports.Background,
            new SubmitApprovedBondMsg(msgId, password)
          );
          setStatusInfo("");
          setStatus(Status.Completed);
          break;
        }
        case TxType.Transfer: {
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
          await requester.sendMessage(
            Ports.Background,
            new SubmitApprovedTransferMsg(msgId, password)
          );
          setStatusInfo("");
          setStatus(Status.Completed);
          break;
        }
        case TxType.Unbond: {
          await requester.sendMessage(
            Ports.Background,
            new SubmitApprovedUnbondMsg(msgId, password)
          );
          setStatusInfo("");
          setStatus(Status.Completed);
          break;
        }
      }
    } catch (e) {
      console.info(e);
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [password]);

  useEffect(() => {
    (async () => {
      if (status === Status.Completed) {
        await closeCurrentTab();
      }
    })();
  }, [status]);

  return (
    <ApprovalContainer>
      {status === Status.Pending && (
        <InfoHeader>
          <InfoLoader />
          <p>{statusInfo}</p>
        </InfoHeader>
      )}
      {status === Status.Failed && (
        <p>
          {error}
          <br />
          Try again
        </p>
      )}
      {status !== (Status.Pending || Status.Completed) && (
        <>
          <div>
            Decrypt keys for <Address>{shortenAddress(source)}</Address>
          </div>
          <Input
            variant={InputVariants.Password}
            label={"Password"}
            onChangeCallback={(e) => setPassword(e.target.value)}
          />
          <ButtonContainer>
            <Button
              onClick={handleApproveTx}
              disabled={!password}
              variant={ButtonVariant.Contained}
            >
              Authenticate
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant={ButtonVariant.Contained}
            >
              Back
            </Button>
          </ButtonContainer>
        </>
      )}
    </ApprovalContainer>
  );
};

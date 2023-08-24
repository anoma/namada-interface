import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  ButtonVariant,
  Input,
  InputVariants,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { TxType, TxTypeLabel } from "@namada/shared";

import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
  InfoHeader,
  InfoLoader,
} from "Approvals/Approvals.components";
import { Ports } from "router";
import { useRequester } from "hooks/useRequester";
import { Address } from "App/Accounts/AccountListing.components";
import { closeCurrentTab } from "utils";
import { FetchAndStoreMaspParamsMsg, HasMaspParamsMsg } from "provider";
import { ApproveMsg, SupportedTx, txMap } from "Approvals/types";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmTx: React.FC<Props> = ({ details }) => {
  const { source, msgId, txType } = details || {};
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
      const Msg: ApproveMsg | undefined = txMap.get(txType as SupportedTx);
      if (!msgId) {
        throw new Error("msgId was not provided!");
      }
      if (!Msg) {
        throw new Error("Unsupported transaction!");
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

      requester.sendMessage(Ports.Background, new Msg(msgId, password));
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
      {status !== (Status.Pending || Status.Completed) && source && (
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

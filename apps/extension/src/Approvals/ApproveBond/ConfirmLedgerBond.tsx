import { useCallback, useState } from "react";
import { toBase64 } from "@cosmjs/encoding";
import BigNumber from "bignumber.js";

import { LedgerError } from "@anoma/ledger-namada";
import { Button, ButtonVariant } from "@anoma/components";
import { defaultChainId as chainId } from "@anoma/chains";

import { Ledger } from "background/ledger";
import {
  GetBondBytesMsg,
  GetRevealPKBytesMsg,
  SubmitSignedBondMsg,
  SubmitSignedRevealPKMsg,
} from "background/ledger/messages";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { InfoHeader, InfoLoader } from "Approvals/Approvals.components";
import { Message, RevealPKProps, Tokens } from "@anoma/types";
import { SubmitRevealPKMsgSchema, RevealPKMsgValue } from "@anoma/types";
import { QueryPublicKeyMsg } from "background/keyring";

type Props = {
  address: string;
  msgId: string;
  publicKey: string;
};

export const ConfirmLedgerBond: React.FC<Props> = ({
  address,
  msgId,
  publicKey,
}) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");

  const revealPk = async (publicKey: string): Promise<void> => {
    const revealPKArgs: RevealPKProps = {
      tx: {
        token: Tokens.NAM.address || "",
        feeAmount: new BigNumber(0),
        gasLimit: new BigNumber(0),
        chainId,
        publicKey,
      },
      publicKey,
    };

    const revealTxValue = new RevealPKMsgValue(revealPKArgs);
    const txMsg = new Message<RevealPKMsgValue>();
    const serializedTx = txMsg.encode(SubmitRevealPKMsgSchema, revealTxValue);

    // Open Ledger transport
    const ledger = await Ledger.init();

    try {
      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetRevealPKBytesMsg(toBase64(serializedTx))
      );

      // Sign with Ledgeg
      const signatures = await ledger.sign(bytes, path);

      // Submit signatures for tx
      setStatusInfo("Submitting reveal pk tx...");
      await requester.sendMessage(
        Ports.Background,
        new SubmitSignedRevealPKMsg(
          toBase64(serializedTx),
          toBase64(bytes),
          signatures
        )
      );
    } catch (e) {
      console.warn("An error occured: ", e);
      throw new Error(`${e}`);
    } finally {
      await ledger.closeTransport();
    }
  };

  const queryPublicKey = async (
    address: string
  ): Promise<string | undefined> => {
    return await requester.sendMessage(
      Ports.Background,
      new QueryPublicKeyMsg(address)
    );
  };

  const submitBond = async (): Promise<void> => {
    setStatus(Status.Pending);
    setStatusInfo("Querying for public key on chain...");

    const pk = await queryPublicKey(address);

    if (!pk) {
      setStatusInfo(
        "Public key not found! Review and approve reveal pk on your Ledger"
      );
      await revealPk(publicKey);
    }

    // Open ledger transport
    const ledger = await Ledger.init();

    try {
      // Constuct tx bytes from SDK
      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetBondBytesMsg(msgId)
      );

      setStatusInfo("Review and approve bond transaction on your Ledger");
      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        console.warn("Bond sign errors encountered, exiting: ", {
          returnCode,
          errorMessage,
        });
        setError(errorMessage);
        return setStatus(Status.Failed);
      }

      // Submit signatures for tx
      setStatusInfo("Submitting bond transaction...");
      await requester.sendMessage(
        Ports.Background,
        new SubmitSignedBondMsg(msgId, toBase64(bytes), signatures)
      );
      setStatus(Status.Completed);
    } catch (e) {
      console.warn(e);
      setStatus(Status.Failed);
      await ledger.closeTransport();
    }
  };

  const handleCloseTab = useCallback(async (): Promise<void> => {
    await closeCurrentTab();
  }, []);

  return (
    <ApprovalContainer>
      {status === Status.Failed && (
        <p>
          {error}
          <br />
          Try again
        </p>
      )}
      {status === Status.Pending && (
        <InfoHeader>
          <InfoLoader />
          {statusInfo}
        </InfoHeader>
      )}
      {status !== Status.Pending && status !== Status.Completed && (
        <>
          <p>Make sure your Ledger is unlocked, and click &quot;Submit&quot;</p>
          <ButtonContainer>
            <Button variant={ButtonVariant.Contained} onClick={submitBond}>
              Submit
            </Button>
          </ButtonContainer>
        </>
      )}
      {status === Status.Completed && (
        <>
          <p>Success! You may close this window.</p>
          <ButtonContainer>
            <Button variant={ButtonVariant.Contained} onClick={handleCloseTab}>
              Close
            </Button>
          </ButtonContainer>
        </>
      )}
    </ApprovalContainer>
  );
};

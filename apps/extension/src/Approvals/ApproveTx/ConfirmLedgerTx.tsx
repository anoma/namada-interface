import { useCallback, useState } from "react";
import { toBase64 } from "@cosmjs/encoding";
import BigNumber from "bignumber.js";

import { LedgerError, ResponseSign } from "@namada/ledger-namada";
import { Button, ButtonVariant } from "@namada/components";
import { defaultChainId as chainId } from "@namada/chains";
import { TxType } from "@namada/shared";
import { Message, Tokens, TxProps } from "@namada/types";

import { Ledger } from "background/ledger";
import {
  GetRevealPKBytesMsg,
  GetTxBytesMsg,
  SubmitSignedBondMsg,
  SubmitSignedRevealPKMsg,
  SubmitSignedTransferMsg,
} from "background/ledger/messages";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
} from "Approvals/Approvals.components";
import { InfoHeader, InfoLoader } from "Approvals/Approvals.components";

import { QueryPublicKeyMsg } from "background/keyring";
import { TxTypeLabel } from "Approvals/types";
import { TxMsgValue } from "@namada/types/src/tx/schema/tx";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmLedgerTx: React.FC<Props> = ({ details }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const { source, msgId = "", publicKey, txType } = details || {};

  const revealPk = async (publicKey: string): Promise<void> => {
    const txArgs: TxProps = {
      token: Tokens.NAM.address || "",
      feeAmount: new BigNumber(0),
      gasLimit: new BigNumber(0),
      chainId,
      publicKey,
    };

    const msgValue = new TxMsgValue(txArgs);
    const msg = new Message<TxMsgValue>();
    const encoded = msg.encode(msgValue);

    // Open Ledger transport
    const ledger = await Ledger.init();

    try {
      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetRevealPKBytesMsg(toBase64(encoded))
      );

      // Sign with Ledgeg
      const signatures = await ledger.sign(bytes, path);

      // Submit signatures for tx
      setStatusInfo("Submitting reveal pk tx...");
      await requester.sendMessage(
        Ports.Background,
        new SubmitSignedRevealPKMsg(
          toBase64(encoded),
          toBase64(bytes),
          signatures
        )
      );
    } catch (e) {
      console.warn("An error occured: ", e);
      await ledger.closeTransport();
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

  const handleSubmitTx = useCallback(async (): Promise<void> => {
    setStatus(Status.Pending);
    setStatusInfo("Querying for public key on chain...");

    if (source && publicKey) {
      const pk = await queryPublicKey(source);

      if (!pk) {
        setStatusInfo(
          "Public key not found! Review and approve reveal pk on your Ledger"
        );
        await revealPk(publicKey);
      }

      return await submitTx();
    }
  }, [source, publicKey]);

  // TODO: This will not be necessary when `submit_signed_tx` is implemented!
  const submitByType = async (
    bytes: Uint8Array,
    signatures: ResponseSign,
    type?: TxType
  ): Promise<void> => {
    switch (type) {
      case TxType.Bond:
        return await requester.sendMessage(
          Ports.Background,
          new SubmitSignedBondMsg(msgId, toBase64(bytes), signatures)
        );
      case TxType.Transfer:
        return await requester.sendMessage(
          Ports.Background,
          new SubmitSignedTransferMsg(msgId, toBase64(bytes), signatures)
        );
      default:
        throw new Error("Invalid transaction type!");
    }
  };

  const submitTx = async (): Promise<void> => {
    // Open ledger transport
    const ledger = await Ledger.init();
    const txLabel = TxTypeLabel[txType as TxType];

    try {
      // Constuct tx bytes from SDK
      if (!txType) {
        throw new Error("txType was not provided!");
      }
      if (!source) {
        throw new Error("source was not provided!");
      }

      const { bytes, path } = await requester.sendMessage(
        Ports.Background,
        new GetTxBytesMsg(txType, msgId, source)
      );

      setStatusInfo(`Review and approve ${txLabel} transaction on your Ledger`);

      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        console.warn(`${txLabel} signing errors encountered, exiting: `, {
          returnCode,
          errorMessage,
        });
        setError(errorMessage);
        return setStatus(Status.Failed);
      }

      // Submit signatures for tx
      setStatusInfo(`Submitting ${txLabel} transaction...`);
      await submitByType(bytes, signatures, txType);
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
            <Button variant={ButtonVariant.Contained} onClick={handleSubmitTx}>
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

import { useCallback, useState } from "react";
import { toBase64 } from "@cosmjs/encoding";
import BigNumber from "bignumber.js";

import { LedgerError } from "@namada/ledger-namada";
import { Button, ButtonVariant } from "@namada/components";
import { defaultChainId as chainId } from "@namada/chains";
import { TxType } from "@namada/shared";
import { Message, Tokens, TxProps, TxMsgValue } from "@namada/types";

import {
  GetRevealPKBytesMsg,
  GetTxBytesMsg,
  Ledger,
  QueryStoredPK,
  StoreRevealedPK,
  SubmitSignedRevealPKMsg,
  SubmitSignedTxMsg,
} from "background/ledger";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { useRequester } from "hooks/useRequester";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import {
  ApprovalContainer,
  ButtonContainer,
  ErrorMessage,
} from "Approvals/Approvals.components";
import { InfoHeader, InfoLoader } from "Approvals/Approvals.components";

import { QueryPublicKeyMsg } from "background/keyring";
import { TxTypeLabel } from "Approvals/types";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmLedgerTx: React.FC<Props> = ({ details }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const { source, msgId, publicKey, txType } = details || {};

  const revealPk = async (ledger: Ledger, publicKey: string): Promise<void> => {
    setStatusInfo(
      "Public key not found! Review and approve reveal pk on your Ledger"
    );

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
    const { bytes, path } = await requester
      .sendMessage(Ports.Background, new GetRevealPKBytesMsg(toBase64(encoded)))
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });

    // Sign with Ledger
    const signatures = await ledger.sign(bytes, path);

    const { returnCode, errorMessage } = signatures;

    if (returnCode !== LedgerError.NoErrors) {
      throw new Error(`Reveal PK error encountered: ${errorMessage}`);
    }

    // Submit signatures for tx
    setStatusInfo("Submitting reveal pk tx...");

    await requester
      .sendMessage(
        Ports.Background,
        new SubmitSignedRevealPKMsg(
          toBase64(encoded),
          toBase64(bytes),
          signatures
        )
      )
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });
  };

  const queryPublicKey = async (
    address: string
  ): Promise<string | undefined> => {
    return await requester
      .sendMessage(Ports.Background, new QueryPublicKeyMsg(address))
      .catch((e) => {
        throw new Error(`Query Public Key error: ${e}`);
      });
  };

  const storePublicKey = async (publicKey: string): Promise<void> => {
    return await requester
      .sendMessage(Ports.Background, new StoreRevealedPK(publicKey))
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });
  };

  const submitTx = async (ledger: Ledger): Promise<void> => {
    // Open ledger transport
    const txLabel = TxTypeLabel[txType as TxType];

    // Constuct tx bytes from SDK
    if (!txType) {
      throw new Error("txType was not provided!");
    }
    if (!source) {
      throw new Error("source was not provided!");
    }
    if (!msgId) {
      throw new Error("msgId was not provided!");
    }

    const { bytes, path } = await requester
      .sendMessage(Ports.Background, new GetTxBytesMsg(txType, msgId, source))
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });

    setStatusInfo(`Review and approve ${txLabel} transaction on your Ledger`);

    // Sign with Ledger
    const signatures = await ledger.sign(bytes, path);
    const { errorMessage, returnCode } = signatures;

    if (returnCode !== LedgerError.NoErrors) {
      throw new Error(`Signing error encountered: ${errorMessage}`);
    }

    // Submit signatures for tx
    setStatusInfo(`Submitting ${txLabel} transaction...`);

    await requester
      .sendMessage(
        Ports.Background,
        new SubmitSignedTxMsg(txType, msgId, toBase64(bytes), signatures)
      )
      .catch((e) => {
        throw new Error(`Requester error: ${e}`);
      });
  };

  const handleSubmitTx = useCallback(async (): Promise<void> => {
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
      return setStatus(Status.Failed);
    }

    setStatus(Status.Pending);

    try {
      if (source && publicKey) {
        // Query extension storage for revealed public key
        const isPkRevealed = await requester
          .sendMessage(Ports.Background, new QueryStoredPK(publicKey))
          .catch((e) => {
            throw new Error(`Requester error: ${e}`);
          });

        if (!isPkRevealed) {
          setStatusInfo("Querying for public key on chain...");
          const pk = await queryPublicKey(source);

          if (pk) {
            // If found on chain, but not in storage, commit to storage
            await storePublicKey(publicKey);
          } else {
            // Submit RevealPK Tx
            await revealPk(ledger, publicKey);

            // Follow up with a query to ensure that PK Reveal was successful
            setStatusInfo("Querying for public key status on chain...");
            const wasPkRevealed = !!(await queryPublicKey(source));

            if (!wasPkRevealed) {
              throw new Error("Public key was not revealed!");
            }

            // Commit newly revealed public key to storage
            await storePublicKey(publicKey);
          }
        }

        await submitTx(ledger);

        return setStatus(Status.Completed);
      }
    } catch (e) {
      await ledger.closeTransport();
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [source, publicKey]);

  const handleCloseTab = useCallback(async (): Promise<void> => {
    await closeCurrentTab();
  }, []);

  return (
    <ApprovalContainer>
      {status === Status.Failed && (
        <ErrorMessage>
          {error}
          <br />
          Try again
        </ErrorMessage>
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

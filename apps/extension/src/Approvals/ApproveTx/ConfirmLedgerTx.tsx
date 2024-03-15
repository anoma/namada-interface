import { toBase64 } from "@cosmjs/encoding";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useState } from "react";

import { ActionButton, Alert, Stack } from "@namada/components";
import { TxType, TxTypeLabel } from "@namada/sdk/web";
import { Message, TxMsgValue, TxProps } from "@namada/types";
import { LedgerError } from "@zondax/ledger-namada";
import { ApprovalDetails, Status } from "Approvals/Approvals";
import { QueryPublicKeyMsg } from "background/keyring";
import {
  GetRevealPKBytesMsg,
  GetTxBytesMsg,
  Ledger,
  QueryStoredPK,
  StoreRevealedPK,
  SubmitSignedRevealPKMsg,
  SubmitSignedTxMsg,
} from "background/ledger";
import { useRequester } from "hooks/useRequester";
import { GetChainMsg } from "provider";
import { Ports } from "router";
import { closeCurrentTab } from "utils";

type Props = {
  details?: ApprovalDetails;
};

export const ConfirmLedgerTx: React.FC<Props> = ({ details }) => {
  const requester = useRequester();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<Status>();
  const [statusInfo, setStatusInfo] = useState("");
  const { source, msgId, publicKey, txType, nativeToken } = details || {};

  useEffect(() => {
    if (status === Status.Completed) {
      void closeCurrentTab();
    }
  }, [status]);

  const revealPk = async (ledger: Ledger, publicKey: string): Promise<void> => {
    setStatusInfo(
      "Public key not found! Review and approve reveal pk on your Ledger"
    );

    const chain = await requester.sendMessage(
      Ports.Background,
      new GetChainMsg()
    );

    if (!nativeToken) {
      throw new Error("Native token is required!");
    }

    const txArgs: TxProps = {
      token: nativeToken,
      feeAmount: new BigNumber(0),
      gasLimit: new BigNumber(20_000),
      chainId: chain.chainId,
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

    try {
      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);

      const { returnCode, errorMessage } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(`Reveal PK error encountered: ${errorMessage}`);
      }

      // Submit signatures for tx
      setStatusInfo("Revealing public key on chain...");

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
    } catch (e) {
      throw new Error(`Unable to parse tx on Ledger: ${e}`);
    }
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

    // Construct tx bytes from SDK
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

    try {
      // Sign with Ledger
      const signatures = await ledger.sign(bytes, path);
      const { errorMessage, returnCode } = signatures;

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(`Signing error encountered: ${errorMessage}`);
      }

      // Submit signatures for tx
      requester
        .sendMessage(
          Ports.Background,
          new SubmitSignedTxMsg(txType, msgId, toBase64(bytes), signatures)
        )
        .catch((e) => {
          throw new Error(`Requester error: ${e}`);
        });

      setStatus(Status.Completed);
    } catch (e) {
      await ledger.closeTransport();
      setError(`${e}`);
      setStatus(Status.Failed);
    }
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

    setStatusInfo("Preparing transaction...");
    setStatus(Status.Pending);

    try {
      if (!source) {
        throw new Error("Source was not provided and is required!");
      }

      // If the source is the faucet address, this is a testnet faucet transfer, and
      // we do not need to reveal the public key, as it is an Established Address
      if (!publicKey) {
        throw new Error("Public key was not provided and is required!");
      }

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
    } catch (e) {
      await ledger.closeTransport();
      setError(`${e}`);
      setStatus(Status.Failed);
    }
  }, [source, publicKey]);

  return (
    <Stack gap={12}>
      {status !== Status.Pending && status !== Status.Completed && (
        <Alert type="warning">
          Make sure your Ledger is unlocked, and click &quot;Submit&quot;
        </Alert>
      )}
      {status === Status.Failed && (
        <Alert type="error">
          {error}
          <br />
          Try again
        </Alert>
      )}
      {status === Status.Pending && <Alert type="info">{statusInfo}</Alert>}
      {status !== Status.Pending && status !== Status.Completed && (
        <>
          <p className="text-white">
            Make sure your Ledger is unlocked, and click &quot;Submit&quot;
          </p>
          <div className="flex">
            <ActionButton onClick={handleSubmitTx}>Submit</ActionButton>
          </div>
        </>
      )}
    </Stack>
  );
};

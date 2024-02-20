import { LedgerError } from "@zondax/ledger-namada";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Image, Stack } from "@namada/components";
import { LedgerStep, PageHeader } from "Setup/Common";
import routes from "Setup/routes";
import { Ledger as LedgerApp } from "background/ledger";

export const LedgerConnect: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [isLedgerConnecting, setIsLedgerConnecting] = useState(false);
  const [ledger, setLedger] = useState<LedgerApp>();

  const queryLedger = async (ledger: LedgerApp): Promise<void> => {
    setError(undefined);
    try {
      const {
        version: { errorMessage, returnCode },
      } = await ledger.status();

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(errorMessage);
      }

      setIsLedgerConnecting(true);
      const { address, publicKey } = await ledger.showAddressAndPublicKey();
      setIsLedgerConnecting(false);
      navigate(routes.ledgerImport(), {
        state: {
          address,
          publicKey,
        },
      });
    } catch (e) {
      setIsLedgerConnecting(false);
      handleError(e);
    } finally {
      await ledger.closeTransport();
    }
  };

  const connectUSB = async (): Promise<void> => {
    try {
      const ledger = await LedgerApp.init();
      setLedger(ledger);
    } catch (e) {
      handleError(e);
    }
  };

  const connectNamadaApp = async (): Promise<void> => {
    if (ledger) {
      queryLedger(ledger);
    }
  };

  const resetOnError = (): void => {
    setLedger(undefined);
  };

  const handleError = (e: unknown): void => {
    resetOnError();

    if (e instanceof Error) {
      setError(e.message);
      return;
    }

    setError(`${e}`);
  };

  return (
    <>
      <Stack gap={12}>
        <PageHeader title="Connect Your Ledger HW" />
        <Stack as="ol" gap={4}>
          {error && (
            <Alert title="Error" type="error">
              {error}
            </Alert>
          )}

          {isLedgerConnecting && (
            <Alert type="warning">Review on your Ledger</Alert>
          )}

          <LedgerStep
            title="Step 1"
            text="Connect and unlock your ledger Hardware Wallet"
            onClick={() => connectUSB()}
            active={!ledger}
            complete={!!ledger}
            buttonDisabled={!!ledger}
            image={
              <Image styleOverrides={{ width: "100%" }} imageName="Ledger" />
            }
          />

          <LedgerStep
            title="Step 2"
            text="Open the Namada App on your ledger device"
            active={!!ledger}
            complete={false}
            onClick={() => connectNamadaApp()}
            buttonDisabled={!ledger || isLedgerConnecting}
            image={
              <Image
                styleOverrides={{ width: "100%" }}
                imageName="LogoMinimal"
              />
            }
          />
        </Stack>
      </Stack>
    </>
  );
};

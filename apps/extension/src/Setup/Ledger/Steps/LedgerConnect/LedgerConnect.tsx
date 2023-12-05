import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Alert,
  Heading,
  Image,
  ImageName,
  Stack,
  Text,
} from "@namada/components";
import { LedgerError } from "@zondax/ledger-namada";
import { formatRouterPath } from "@namada/utils";
import { Ledger as LedgerApp } from "background/ledger";
import { LedgerConnectRoute, TopLevelRoute } from "Setup/types";
import {
  ButtonContainer,
  LedgerIcon,
  LedgerItemContainer,
  LedgerListItem,
} from "./LedgerConnect.components";

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

      navigate(
        formatRouterPath([TopLevelRoute.Ledger, LedgerConnectRoute.Import]),
        {
          state: {
            address,
            publicKey,
          },
        }
      );
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
        <Heading uppercase level="h1" size="3xl">
          Connect Your Ledger HW
        </Heading>

        <Stack as="ol" gap={4}>
          {error && (
            <Alert title="Error" type="error">
              {error}
            </Alert>
          )}
          {isLedgerConnecting && (
            <Alert type="warning">Review on your Ledger</Alert>
          )}
          <LedgerListItem active={!ledger} complete={!!ledger}>
            <LedgerIcon>
              <Image
                styleOverrides={{ width: "100%" }}
                imageName={ImageName.Ledger}
              />
            </LedgerIcon>
            <LedgerItemContainer>
              <Heading level="h2" size="sm" themeColor="primary">
                Step 1
              </Heading>
              <Text>Connect and unlock your ledger Hardware Wallet</Text>
              <ButtonContainer>
                <ActionButton
                  disabled={!!ledger}
                  size="xs"
                  onClick={() => connectUSB()}
                >
                  Next
                </ActionButton>
              </ButtonContainer>
            </LedgerItemContainer>
          </LedgerListItem>

          <LedgerListItem active={!!ledger} complete={false}>
            <LedgerIcon>
              <Image
                styleOverrides={{ width: "100%" }}
                imageName={ImageName.LogoMinimal}
              />
            </LedgerIcon>
            <LedgerItemContainer>
              <Heading level="h2" size="sm" themeColor="primary">
                Step 2
              </Heading>
              <Text>Open the Namada App on your ledger device</Text>
              <ButtonContainer>
                <ActionButton
                  disabled={!ledger || isLedgerConnecting}
                  size="xs"
                  onClick={() => connectNamadaApp()}
                >
                  Next
                </ActionButton>
              </ButtonContainer>
            </LedgerItemContainer>
          </LedgerListItem>
        </Stack>
      </Stack>
    </>
  );
};

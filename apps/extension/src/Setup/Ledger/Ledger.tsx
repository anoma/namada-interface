import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ActionButton,
  Alert,
  Heading,
  Icon,
  Image,
  ImageName,
  Stack,
  Text,
} from "@namada/components";
import { LedgerError } from "@namada/ledger-namada";

import { initLedgerHIDTransport, Ledger as LedgerApp } from "background/ledger";
import { HeaderContainer } from "Setup/Setup.components";
import { TopLevelRoute } from "Setup/types";
import {
  LedgerIcon,
  LedgerItemContainer,
  LedgerListItem,
} from "./Ledger.components";
import { Password } from "Setup/Common";

const Ledger: React.FC = () => {
  const navigate = useNavigate();

  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();

  const [password, setPassword] = useState<string | null>("");
  const [keysName, setKeysName] = useState("");

  const queryLedger = async (ledger: LedgerApp): Promise<void> => {
    try {
      const {
        version: { errorMessage, returnCode },
      } = await ledger.status();

      if (returnCode !== LedgerError.NoErrors) {
        throw new Error(errorMessage);
      }

      const { address, publicKey } = await ledger.getAddressAndPublicKey();
      navigate(
        `/${TopLevelRoute.LedgerConfirmation}/${alias}/${address}/${publicKey}`
      );
    } catch (e) {
      setError(`${e}`);
    } finally {
      await ledger.closeTransport();
    }
  };

  /**
   * Connect using default USB transport
   */
  const handleConnectUSB = async (): Promise<void> => {
    try {
      const ledger = await LedgerApp.init();
      queryLedger(ledger);
    } catch (e) {
      setError(`${e}`);
    }
  };

  /**
   * Connect using HID transport
   */
  const handleConnectHID = async (): Promise<void> => {
    const transport = await initLedgerHIDTransport();
    try {
      const ledger = await LedgerApp.init(transport);
      queryLedger(ledger);
    } catch (e) {
      setError(`${e}`);
    }
  };

  const importKeys = (e: React.FormEvent): void => {
    e.preventDefault();
    // TODO: import keys
  };

  return (
    <>
      <Stack gap={12}>
        <Heading level="h1" size="3xl">
          Connect Your Ledger HW
        </Heading>
        {error && <Alert type="error">{error}</Alert>}

        <Stack as="ul" gap={4}>
          <LedgerListItem active={true} complete={false}>
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
            </LedgerItemContainer>
          </LedgerListItem>

          <LedgerListItem active={false} complete={true}>
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
            </LedgerItemContainer>
          </LedgerListItem>
        </Stack>
        <ActionButton disabled={true}>Next</ActionButton>

        {/* <Button
          onClick={() => handleConnectUSB()}
          variant={ButtonVariant.Contained}
          disabled={alias === ""}
        >
          Connect USB
        </Button>

        <Button
          onClick={() => handleConnectHID()}
          variant={ButtonVariant.Contained}
          disabled={alias === ""}
        >
          Connect HID
        </Button> */}
      </Stack>

      {/* TODO: This should appear after the previous flow is complete: */}
      <Stack gap={12}>
        <Heading level="h1" size="3xl">
          Import your Keys from Ledger HW
        </Heading>
        <Stack as="form" gap={6} onSubmit={importKeys}>
          <Password
            onChangeKeysName={setKeysName}
            onValidPassword={setPassword}
            keysName={keysName}
          />
        </Stack>
        <ActionButton disabled={true}>Next</ActionButton>
      </Stack>
    </>
  );
};

export default Ledger;

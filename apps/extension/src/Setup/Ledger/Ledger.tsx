import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";

import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
  Input,
  InputVariants,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";

import { initLedgerHIDTransport, Ledger as LedgerApp } from "background/ledger";
import { LedgerError } from "./Ledger.components";
import {
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  ButtonsContainer,
  SubViewContainer,
  UpperContentContainer,
  Header1,
  FormContainer,
} from "Setup/Setup.components";
import { TopLevelRoute } from "Setup/types";

const Ledger: React.FC = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();

  const queryLedger = async (ledger: LedgerApp): Promise<void> => {
    try {
      // Get address and public key for default account
      const { address, publicKey } = await ledger.getAddressAndPublicKey();
      navigate(
        `/${TopLevelRoute.LedgerConfirmation}/${alias}/${address}/${publicKey}`
      );
    } catch (_) {
      checkErrors(ledger);
    }
  };

  const checkErrors = async (ledger: LedgerApp): Promise<void> => {
    const errorMessage = await ledger.queryErrors();

    if (errorMessage) {
      await ledger.closeTransport();
      setError(errorMessage);
      throw new Error(errorMessage);
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
      setError(`Failed to connect to Ledger: ${e}`);
    }
  };

  /**
   * Connect using HID transport
   */
  const handleConnectHID = async (): Promise<void> => {
    try {
      const transport = await initLedgerHIDTransport();
      const ledger = await LedgerApp.init(transport);
      queryLedger(ledger);
    } catch (e) {
      setError(`Failed to connect to Ledger: ${e}`);
    }
  };

  return (
    <SubViewContainer>
      <TopSection>
        <TopSectionButtonContainer>
          <a onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <Icon
              iconName={IconName.ChevronLeft}
              strokeColorOverride={themeContext.colors.utility2.main60}
              iconSize={IconSize.L}
            />
          </a>
        </TopSectionButtonContainer>
        <TopSectionHeaderContainer></TopSectionHeaderContainer>
      </TopSection>

      <UpperContentContainer>
        <Header1>Connect Ledger</Header1>
      </UpperContentContainer>

      {error && <LedgerError>{error}</LedgerError>}
      <FormContainer>
        <Input
          label={"Alias"}
          value={alias}
          onChangeCallback={(e) => setAlias(e.target.value)}
          variant={InputVariants.Text}
        />
      </FormContainer>
      <ButtonsContainer>
        <Button
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
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};

export default Ledger;

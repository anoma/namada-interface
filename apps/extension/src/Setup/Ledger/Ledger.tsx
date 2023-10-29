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
import { LedgerError } from "@namada/ledger-namada";

import { initLedgerHIDTransport, Ledger as LedgerApp } from "background/ledger";
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
import { LedgerErrorMessage } from "./Ledger.components";

const Ledger: React.FC = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();

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

      {error && <LedgerErrorMessage>{error}</LedgerErrorMessage>}
      <FormContainer>
        <Input
          label={"Alias"}
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
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

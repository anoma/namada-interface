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
import { ExtensionRequester } from "extension";
import { LedgerError } from "./Ledger.components";
import {
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  ButtonsContainer,
  SubViewContainer,
  UpperContentContainer,
  Header1,
  BodyText,
  FormContainer,
} from "Setup/Setup.components";

type Props = {
  requester: ExtensionRequester;
};

const Ledger: React.FC<Props> = ({ requester: _ }) => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string>();
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string>();
  const [appInfo, setAppInfo] = useState<{ name: string; version: string }>();

  const queryLedger = async (ledger: LedgerApp): Promise<void> => {
    const pk = await ledger.getPublicKey();
    const { appName, appVersion } = ledger.status();

    setAppInfo({ name: appName, version: appVersion });
    setPublicKey(pk);
    setIsConnected(true);
  };

  /**
   * Connect using default USB transport
   */
  const handleConnectUSB = async (): Promise<void> => {
    try {
      queryLedger(await LedgerApp.init());
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
      queryLedger(await LedgerApp.init(transport));
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
      {/* TODO: Navigate to next step for adding this account to background service. The following is temporary: */}
      {isConnected && (
        <>
          <BodyText>
            Connection successful for <b>&quot;{alias}&quot;</b>!
          </BodyText>
          <BodyText>
            Public key: {publicKey && shortenAddress(publicKey)}
          </BodyText>
          {appInfo && (
            <>
              <BodyText>Name: {appInfo.name}</BodyText>
              <BodyText>Version: {appInfo.version}</BodyText>
            </>
          )}
        </>
      )}
      {!isConnected && (
        <>
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
        </>
      )}
    </SubViewContainer>
  );
};

export default Ledger;

import React, { useCallback, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";

import {
  Button,
  ButtonVariant,
  Icon,
  IconName,
  IconSize,
} from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { useSanitizedParams } from "@namada/hooks";

import { useRequester } from "hooks/useRequester";
import { LedgerErrorMessage } from "./Ledger.components";
import {
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  ButtonsContainer,
  SubViewContainer,
  UpperContentContainer,
  Header1,
  BodyText,
} from "Setup/Setup.components";
import { Ports } from "router";
import { closeCurrentTab } from "utils";
import { AddLedgerParentAccountMsg } from "background/ledger";

const LedgerConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const requester = useRequester();
  const themeContext = useContext(ThemeContext);
  const { alias = "", address = "", publicKey = "" } = useSanitizedParams();
  const [error, setError] = useState<string>();

  const handleSubmitClick = useCallback(async (): Promise<void> => {
    try {
      await requester.sendMessage(
        Ports.Background,
        new AddLedgerParentAccountMsg(alias, address, publicKey, {
          account: 0,
          change: 0,
          index: 0,
        })
      );
      closeCurrentTab();
    } catch (e) {
      console.warn(e);
      setError(`${e}`);
    }
  }, []);

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
        <Header1>Confirm Ledger Connection</Header1>
      </UpperContentContainer>

      {error && <LedgerErrorMessage>{error}</LedgerErrorMessage>}
      <BodyText>
        Connection successful for <b>&quot;{alias}&quot;</b>!
      </BodyText>
      <BodyText>Address: {address && shortenAddress(address)}</BodyText>
      <BodyText>Add this address to your wallet?</BodyText>
      <ButtonsContainer>
        <Button variant={ButtonVariant.Contained} onClick={handleSubmitClick}>
          Add to wallet and close
        </Button>
      </ButtonsContainer>
    </SubViewContainer>
  );
};

export default LedgerConfirmation;

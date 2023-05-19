import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";

import { Icon, IconName, IconSize } from "@anoma/components";

import {
  SubViewContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  UpperContentContainer,
  Header1,
  ContentContainer,
  BodyText,
} from "Setup/Setup.components";

const ImportAccount: React.FC = () => {
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

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
        <Header1>Import Account</Header1>
      </UpperContentContainer>

      <ContentContainer>
        <BodyText>
          <i>TBD</i>
        </BodyText>
      </ContentContainer>
    </SubViewContainer>
  );
};

export default ImportAccount;

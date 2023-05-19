import React, { useContext } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { Icon, IconName, IconSize } from "@anoma/components";
import { RouteContainer } from "./AccountCreation.components";
import {
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  SubViewContainer,
} from "Setup/Setup.components";

/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * It persists the data between the screens in the flow.
 */
const AccountCreation: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

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
        <TopSectionButtonContainer></TopSectionButtonContainer>
      </TopSection>
      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Outlet />
        </AnimatePresence>
      </RouteContainer>
    </SubViewContainer>
  );
};

export default AccountCreation;

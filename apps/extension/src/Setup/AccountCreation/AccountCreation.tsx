import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeContext } from "styled-components";

import { AccountCreationRoute } from "../types";

import { Icon, IconName, IconSize } from "@anoma/components";
import {
  AccountCreationContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  RouteContainer,
} from "./AccountCreation.components";

/**
 * The main purpose of this is to coordinate the flow for creating a new account.
 * It persists the data between the screens in the flow.
 */
const AccountCreation: React.FC = () => {
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();

  // info for disabling the back button in the last step

  useEffect(() => {
    // at the load we redirect to the first step
    // this way we do not need to expose the flow routes to outside
    navigate(AccountCreationRoute.SeedPhrase);
  }, []);

  return (
    <AccountCreationContainer>
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
    </AccountCreationContainer>
  );
};

export default AccountCreation;

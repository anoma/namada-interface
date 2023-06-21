import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ThemeContext } from "styled-components";

import { Icon, IconName, IconSize } from "@anoma/components";

import {
  SubViewContainer,
  TopSection,
  TopSectionHeaderContainer,
  TopSectionButtonContainer,
  RouteContainer,
} from "Setup/Setup.components";
import { AnimatePresence } from "framer-motion";

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

      <RouteContainer>
        <AnimatePresence exitBeforeEnter>
          <Outlet />
        </AnimatePresence>
      </RouteContainer>
    </SubViewContainer>
  );
};

export default ImportAccount;

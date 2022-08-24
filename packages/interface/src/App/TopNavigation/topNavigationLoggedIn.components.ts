import styled from "styled-components/macro";
import { DesignConfiguration } from "utils/theme";

enum ComponentColor {
  NavItem,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const isDark = theme.themeConfigurations.isLightMode;
  switch (color) {
    case ComponentColor.NavItem:
      return isDark ? theme.colors.primary.main : theme.colors.secondary.main;
  }
};

export const TopNavigationLoggedInContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 760px;
  justify-content: space-between;
  align-items: center;
`;

export const TopNavigationLoggedInControlsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 160px;

  &:first-child {
    padding-right: 20px;
  }
`;

export const SettingsButton = styled.a`
  display: block;
  padding-right: 20px;
  cursor: pointer;
  & > div > svg > path {
    stroke: ${(props) => getColor(ComponentColor.NavItem, props.theme)};
    fill: ${(props) => getColor(ComponentColor.NavItem, props.theme)};
  }
`;

export const TopNavigationLoggedInSelectContainer = styled.div`
  width: 155px;

  @media screen and (max-width: 860px) {
    width: 100%;
  }

  & select {
    font-size: 10px;
  }
`;

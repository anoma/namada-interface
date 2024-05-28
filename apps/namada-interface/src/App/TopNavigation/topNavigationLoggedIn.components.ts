import styled from "styled-components";
import { ColorMode, DesignConfiguration } from "@namada/utils";

enum ComponentColor {
  NavItem,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.NavItem]: theme.colors.secondary.main,
    },
    dark: {
      [ComponentColor.NavItem]: theme.colors.primary.main,
    },
  };

  return colorMap[colorMode][color];
};

export const TopNavigationLoggedInContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 760px;
  justify-content: space-between;
  align-items: center;
`;

export const TopNavigationLoggedInControlsContainer = styled.div`
  display: flex;
  align-items: end;
  flex-direction: row;

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

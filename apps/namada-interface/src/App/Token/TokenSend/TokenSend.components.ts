import styled from "styled-components/macro";
import { DesignConfiguration } from "utils/theme";

enum ComponentColor {
  TabBackgroundColorActive,
  TabBackgroundColor,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const isDark = theme.themeConfigurations.isLightMode;
  switch (color) {
    case ComponentColor.TabBackgroundColorActive:
      return isDark ? theme.colors.utility1.main80 : theme.colors.utility1.main;
    case ComponentColor.TabBackgroundColor:
      return isDark
        ? theme.colors.utility1.main70
        : theme.colors.utility1.main40;
  }
};

export const TokenSendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const TokenSendTabsGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const TokenSendTab = styled.button`
  background-color: ${(props) =>
    getColor(ComponentColor.TabBackgroundColor, props.theme)};
  color: ${(props) => props.theme.colors.utility2.main60};
  width: 100%;
  border: 0;
  padding: 8px 4px;
  height: 78px;
  font-size: 18px;
  font-family: "Space Grotesk", sans-serif;
  cursor: pointer;

  &.active {
    cursor: default;
    color: ${(props) => props.theme.colors.utility2.main80};
    background-color: ${(props) => props.theme.colors.utility1.main80};
    background-color: ${(props) =>
      getColor(ComponentColor.TabBackgroundColorActive, props.theme)};
    color: ${(props) => props.theme.colors.secondary.main};
  }
`;

export const TokenSendContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;

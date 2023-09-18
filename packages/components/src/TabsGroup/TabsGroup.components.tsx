import { ColorMode, DesignConfiguration } from "@namada/utils";
import styled from "styled-components";

enum ComponentColor {
  TabBackgroundColorActive,
  TabBackgroundColor,
  TabColorActive,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.TabBackgroundColor]: theme.colors.utility1.main40,
      [ComponentColor.TabBackgroundColorActive]: theme.colors.utility1.main,
      [ComponentColor.TabColorActive]: theme.colors.secondary.main,
    },
    dark: {
      [ComponentColor.TabBackgroundColor]: theme.colors.utility1.main70,
      [ComponentColor.TabBackgroundColorActive]: theme.colors.utility1.main80,
      [ComponentColor.TabColorActive]: theme.colors.primary.main,
    },
  };

  return colorMap[colorMode][color];
};

export const TabsGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const Tab = styled.button`
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
    background-color: ${(props) =>
      getColor(ComponentColor.TabBackgroundColorActive, props.theme)};
    color: ${(props) => getColor(ComponentColor.TabColorActive, props.theme)};
  }
`;

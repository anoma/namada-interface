import styled, { CSSProperties } from "styled-components/macro";

import { DesignConfiguration, ColorMode } from "utils/theme";

export const CIRCLE_DIAMETER_PIXELS = 20;

const transition = "all 0.3s ease-in-out";

const getCssPropMap = (
  theme: DesignConfiguration
): Record<ColorMode, CSSProperties> => ({
  light: {
    backgroundColor: theme.colors.secondary.main,
  },
  dark: {
    backgroundColor: theme.colors.primary.main,
  },
});

const getColor = (
  color: keyof CSSProperties,
  theme: DesignConfiguration
): CSSProperties[keyof CSSProperties] => {
  const colorMode = theme.themeConfigurations.colorMode;
  return getCssPropMap(theme)[colorMode][color];
};


export const ToggleCircle = styled.div<{
  checked: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${CIRCLE_DIAMETER_PIXELS}px;
  max-width: ${CIRCLE_DIAMETER_PIXELS}px;
  height: ${CIRCLE_DIAMETER_PIXELS}px;
  border: none;
  border-radius: 50%;
  background-color: ${(props) =>
    getColor("backgroundColor", props.theme)};
  box-sizing: border-box;
  transition: ${transition};
`;

import styled, { CSSProperties } from "styled-components/macro";

import { DesignConfiguration, ColorMode } from "utils/theme";
import { CIRCLE_DIAMETER_PIXELS } from "./toggle-circle.component";

const COMPONENT_WIDTH_PIXELS = 46;
const BORDER_PIXELS = 2;

const transition = "all 0.3s ease-in-out";

const getCssPropMap = (
  theme: DesignConfiguration
): Record<ColorMode, CSSProperties> => ({
  light: {
    backgroundColor: theme.colors.utility1.main20,
  },
  dark: {
    backgroundColor: theme.colors.utility1.main60,
  },
});

const getColor = (
  color: keyof CSSProperties,
  theme: DesignConfiguration
): CSSProperties[keyof CSSProperties] => {
  const colorMode = theme.themeConfigurations.colorMode;
  return getCssPropMap(theme)[colorMode][color];
};

export const ToggleContainer = styled.button<{
  checked: boolean;
  isLoading?: boolean;
}>`
  display: flex;
  align-items: center;
  width: ${COMPONENT_WIDTH_PIXELS}px;
  height: ${CIRCLE_DIAMETER_PIXELS + BORDER_PIXELS + BORDER_PIXELS}px;
  padding: 0;
  padding-left: ${(props) =>
    props.checked
      ? `${BORDER_PIXELS - 1}px`
      : `${
          COMPONENT_WIDTH_PIXELS - CIRCLE_DIAMETER_PIXELS - 1 - BORDER_PIXELS
        }px`};
  border: 1px solid ${(props) => props.theme.colors.primary.main};
  border-radius: 999px;
  background-color: ${(props) => getColor("backgroundColor", props.theme)};
  /* TODO: Make this work for all toggles, not just theme selection */
  transition: ${transition};
  cursor: pointer;
`;

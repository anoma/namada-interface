import styled from "styled-components";
import { ColorMode, DesignConfiguration } from "@anoma/utils";

enum ComponentColor {
  Arrow,
  Label,
  Border,
  Background,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.Arrow]: theme.colors.secondary.main,
      [ComponentColor.Label]: theme.colors.secondary.main,
      [ComponentColor.Border]: theme.colors.utility2.main60,
      [ComponentColor.Background]: theme.colors.utility3.white,
    },
    dark: {
      [ComponentColor.Arrow]: theme.colors.primary.main,
      [ComponentColor.Label]: theme.colors.primary.main,
      [ComponentColor.Border]: "transparent",
      [ComponentColor.Background]: theme.colors.utility1.main70,
    },
  };

  return colorMap[colorMode][color];
};

export const StyledSelectWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  padding: 12px 0;
  margin: 0;

  & > div {
    margin: 0;
    padding: 0;
    pointer-events: none;
    z-index: 1000;
    margin-right: 8px;

    & > svg > path {
      stroke: ${(props) => getColor(ComponentColor.Arrow, props.theme)};
    }
  }
`;

export const StyledSelect = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 0.875em 1em;
  border-radius: 8px;
  position: absolute;
  left: 0;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) =>
    getColor(ComponentColor.Background, props.theme)};
  border: 1px solid ${(props) => getColor(ComponentColor.Border, props.theme)};
  border-radius: 24px;
  height: 30px;
  padding: 0 8px 0 16px;
  cursor: pointer;
  color: ${(props) => getColor(ComponentColor.Arrow, props.theme)};
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.utility2.main60};
  width: 100%;

  & > p {
    padding-bottom: 4px;
    margin: 0;
  }
`;

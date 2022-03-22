import styled from "styled-components/macro";
import { darkColors, lightColors } from "utils/theme";

export const StyledSelectWrapper = styled.div`
  position: relative;
  width: 100%;

  & > div {
    position: absolute;
    right: 20px;
    top: 12px;
    pointer-events: none;
  }
`;

export const StyledSelect = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  padding: 4px 0;
  height: 48px;
  border-radius: 24px;
  padding: 0 20px;
  background-color: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "#fff" : "#000"};
  border: ${(props) =>
    props.theme.themeConfigurations.isLightMode
      ? `2px solid ${lightColors.border}`
      : `2px solid ${darkColors.border}`};
  color: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "#002046" : "#ccc"};
`;

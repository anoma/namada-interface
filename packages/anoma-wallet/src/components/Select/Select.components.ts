import styled from "styled-components/macro";
import { darkColors, lightColors } from "utils/theme";

export const StyledSelectWrapper = styled.div`
  position: relative;
  width: 100%;

  & > div {
    position: absolute;
    right: 20px;
    top: 20px;
    pointer-events: none;
  }
`;

export const StyledSelect = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  margin-top: 10px;
  padding: 0.875em 1em;
  border-radius: 8px;
  background-color: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "#fff" : "#000"};
  border: ${(props) =>
    props.theme.themeConfigurations.isLightMode
      ? `2px solid ${lightColors.inputBorder}`
      : `2px solid ${darkColors.inputBorder}`};
  color: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "#002046" : "#ccc"};
`;

export const Label = styled.label`
  font-weight: 500;
  color: ${(props) => props.theme.colors.inputText};
  width: 100%;
`;

import styled from "styled-components/macro";
import { darkColors, lightColors } from "utils/theme";

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
      stroke: ${(props) => props.theme.colors.buttonBackground2};
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
  background-color: ${(props) => props.theme.colors.inputBackground};
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

  & > p {
    padding-bottom: 4px;
    margin: 0;
  }
`;

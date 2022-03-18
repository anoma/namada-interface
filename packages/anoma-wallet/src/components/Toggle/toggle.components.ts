import styled from "styled-components/macro";

// TODO: connect the theme colors to these
const BACKGROUND_ENABLED = "#F4C54F";
const BACKGROUND_DISABLE = "#E8E8F2";
const COLOR_DISABLED = "#011F43";

const CIRCLE_BACKGROUND_COLOR_ENABLED_LIGHT = "white";
const CIRCLE_BACKGROUND_COLOR_DISABLED_DARK = "white";
const CIRCLE_BORDER_COLOR_ENABLED_LIGHT = "transparent";
const CIRCLE_BORDER_COLOR_DISABLED_DARK = COLOR_DISABLED;

const COMPONENT_WIDTH_PIXELS = 60;
const CIRCLE_DIAMETER_PIXELS = 30;
const BORDER_PIXELS = 3;

const transition = "all 0.3s ease-in-out";
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
      ? `${BORDER_PIXELS}px`
      : `${COMPONENT_WIDTH_PIXELS - CIRCLE_DIAMETER_PIXELS - BORDER_PIXELS}px`};
  border: none;
  border-radius: 999px;
  background-color: ${(props) =>
    props.checked ? BACKGROUND_ENABLED : BACKGROUND_DISABLE};
  transition: ${transition};
  cursor: pointer;
`;

export const ToggleCircle = styled.div<{
  checked: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${CIRCLE_DIAMETER_PIXELS}px;
  max-width: ${CIRCLE_DIAMETER_PIXELS}px;
  height: ${CIRCLE_DIAMETER_PIXELS}px;
  border-radius: 50%;
  border: 2px solid;
  background-color: ${(props) =>
    props.checked
      ? CIRCLE_BACKGROUND_COLOR_ENABLED_LIGHT
      : CIRCLE_BACKGROUND_COLOR_DISABLED_DARK};
  border-color: ${(props) =>
    props.checked
      ? CIRCLE_BORDER_COLOR_ENABLED_LIGHT
      : CIRCLE_BORDER_COLOR_DISABLED_DARK};
  box-sizing: border-box;
  transition: ${transition};
`;

import styled from "styled-components/macro";

// TODO: connect the theme colors to these
const BACKGROUND_ENABLED = "#F4C54F";
const BACKGROUND_DISABLE = "#E8E8F2";

const COMPONENT_WIDTH_PIXELS = 42;
const CIRCLE_DIAMETER_PIXELS = 20;
const BORDER_PIXELS = 1;

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
  border: 1px solid ${(props) => props.theme.colors.utility1.main80};
  border-radius: 999px;
  background-color: ${(props) => props.theme.colors.utility1.main60};
  /* TODO: Make this work for all toggles, not just theme selection */
  /* background-color: ${(props) =>
    props.checked ? BACKGROUND_ENABLED : BACKGROUND_DISABLE}; */
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
  border: none;
  border-radius: 50%;
  background-color: ${(props) => props.theme.colors.primary.main};
  box-sizing: border-box;
  transition: ${transition};
`;

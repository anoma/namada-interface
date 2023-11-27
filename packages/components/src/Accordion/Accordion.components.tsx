import {
  ThemeColor,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";
import { Icon } from "../Icon";
import styled from "styled-components";

export const AccordionTitle = styled.div``;
export const AccordionTitleChevron = styled(Icon)``;

export const AccordionTitleIndicator = styled.i<{ open: boolean }>`
  align-items: center;
  border-radius: 100%;
  border: 2px solid currentColor;
  display: flex;
  height: 35px;
  justify-content: center;
  transition: all 200ms var(--ease-out-quart);
  width: 35px;
  transform: ${(props) => (props.open ? "rotateZ(180deg)" : "")};

  & > div {
    position: relative;
    top: 1px;
  }
`;

export const AccordionTitleContainer = styled.div<{ hoverColor: ThemeColor }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em ${spacement(6)};
  width: 100%;
  cursor: pointer;

  &:hover ${AccordionTitleIndicator} {
    background-color: ${(props) => color(props.hoverColor, "main")(props)};
    color: ${(props) => color(props.hoverColor, "main20")(props)};
  }
`;

export const AccordionContentContainer = styled.div`
  padding: 0 ${spacement(6)} 0.75em;
`;

export const AccordionContainer = styled.div<{
  variant: ThemeColor;
  solid: boolean;
}>`
  align-items: center;
  all: unset;

  background-color: ${(props) => {
    if (props.solid) {
      return color(props.variant, "main")(props);
    }
    return "transparent";
  }};

  border: ${(props) => {
    if (props.solid) {
      return "";
    }
    return `1px solid ${color(props.variant, "main")(props)}`;
  }};

  border-radius: ${borderRadius("md")};
  box-sizing: border-box;

  color: ${(props) => {
    if (props.solid) {
      return color("utility2", "main")(props);
    }
    return color(props.variant, "main")(props);
  }};

  display: flex;
  flex-direction: column;
  font-size: ${fontSize("base")};
  font-weight: 500;
  min-height: 2em;
  width: 100%;

  & ${AccordionTitleChevron} path {
    stroke: ${(props) => {
      if (props.solid) {
        return color("utility2", "main")(props);
      }
      return color(props.variant, "main")(props);
    }};
  }
`;

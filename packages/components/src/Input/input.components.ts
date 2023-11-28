import styled, { ThemeProps, css } from "styled-components";
import {
  DesignConfiguration,
  ThemeColor,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";

type FieldProps = {
  inputTheme?: ThemeColor;
  transparent?: boolean;
  hasIcon?: boolean;
  error: boolean;
};

const getFocusColor = (
  props: ThemeProps<DesignConfiguration>,
  error: boolean,
  inputTheme?: ThemeColor
): string => {
  if (error) return color("utility3", "error")(props);
  if (inputTheme) return "";
  return color("primary", "main")(props);
};

const commonStyles = css<FieldProps>`
  background-color: ${color("utility1", "main")};
  border: 1px solid;
  border-radius: ${borderRadius("sm")};
  border-color: ${(props) =>
    props.inputTheme
      ? color(props.inputTheme, "main")
      : color("utility1", "main50")};
  color: ${color("utility2", "main")};
  font-family: inherit;
  font-size: ${fontSize("base")};
  font-weight: 500;
  line-height: 1.25;
  padding: ${spacement(5)}
    ${(props) => (props.hasIcon ? spacement(12)(props) : spacement(4)(props))}
    ${spacement(5)} ${spacement(4)};
  transition: border-color 100ms ease-out;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${color("utility2", "main20")};
    transition: opacity 150ms ease-out;
  }

  &:hover::placeholder {
    opacity: 0.75;
  }

  &:focus::placeholder {
    opacity: 0;
  }

  &::selection {
    background-color: ${color("utility1", "main60")};
  }

  &:focus {
    border-color: ${(props) =>
      getFocusColor(props, props.error, props.inputTheme)};
  }

  &[readonly] {
    user-select: none;
    pointer-events: none;
  }
`;

export const Label = styled.label`
  color: ${color("utility2", "main")};
  font-size: ${fontSize("base")};
  font-weight: 500;

  & > p {
    padding: 0 0 4px;
    margin: 0;
  }
`;

export const LabelWrapper = styled.span`
  padding-left: ${spacement(1.5)};
`;

export const TextInput = styled.input<FieldProps>`
  ${commonStyles}
`;

export const TextAreaInput = styled.textarea<FieldProps>`
  ${commonStyles}
`;

export const ErrorTooltip = styled.span`
  color: ${color("utility3", "error")};
  display: ${(props) => (props.children ? "inline-block" : "none")};
  font-size: ${fontSize("xs")};
  font-weight: 400;
  padding-left: ${spacement(1.5)};
`;

export const InputWrapper = styled.div`
  display: flex;
  margin: ${spacement(2)} 0 ${spacement(1)};
  position: relative;
`;

export const IconContainer = styled.span`
  align-items: center;
  cursor: pointer;
  display: flex;
  height: 100%;
  position: absolute;
  right: 16px;
  top: 0;

  & path {
    stroke: ${color("primary", "main")};
  }

  & rect {
    stroke: ${color("primary", "main")};
  }
`;

export const HintTooltip = styled.div`
  color: ${color("utility2", "main80")};
  display: ${(props) => (props.children ? "inline-block" : "none")};
  font-size: ${fontSize("xs")};
  font-weight: 300;
  padding-left: ${spacement(1.5)};
`;

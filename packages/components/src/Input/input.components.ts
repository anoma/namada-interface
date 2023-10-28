import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled, { css } from "styled-components";

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

const inputStyles = css`
  background-color: ${color("utility1", "main")};
  border: 1px solid ${color("utility1", "main50")};
  border-radius: ${borderRadius("sm")};
  color: ${color("utility2", "main")};
  font-family: inherit;
  font-size: ${fontSize("base")};
  font-weight: 500;
  margin: ${spacement(2)} 0 ${spacement(1)};
  padding: ${spacement(5)} ${spacement(4)};
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
`;

export const TextInput = styled.input<{ error: boolean }>`
  ${inputStyles}

  &:focus {
    border-color: ${(props) =>
      props.error
        ? color("utility3", "error")(props)
        : color("primary", "main")(props)}
`;

export const TextAreaInput = styled.textarea<{ error: boolean }>`
  ${inputStyles}
  
  &:focus {
    border-color: ${(props) =>
      props.error
        ? color("utility3", "error")(props)
        : color("primary", "main")(props)}
    }
  }
`;

export const ErrorTooltip = styled.span`
  display: ${(props) => (props.children ? "inline-block" : "none")};
  font-size: ${fontSize("xs")};
  color: ${color("utility3", "error")};
  font-weight: 400;
  padding-left: ${spacement(1.5)};
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
`;

export const IconContainer = styled.span`
  position: absolute;
  top: 38%;
  right: 16px;
  cursor: pointer;
  & path {
    stroke: ${color("primary", "main")};
  }
`;

export const HintTooltip = styled.div`
  display: ${(props) => (props.children ? "inline-block" : "none")};
  color: ${color("utility2", "main80")};
  font-size: ${fontSize("xs")};
  font-weight: 300;
  padding-left: ${spacement(1.5)};
`;

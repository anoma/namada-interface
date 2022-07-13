import styled from "styled-components/macro";

export const TextInput = styled.input<{ error: boolean }>`
  background-color: transparent;
  border-width: 2px;
  border-color: ${(props) =>
    props.error
      ? props.theme.colors.inputError
      : props.theme.colors.inputBorder};
  border-style: solid;
  border-radius: 8px;
  color: ${(props) => props.theme.colors.inputText};
  font-weight: 500;
  margin-top: 10px;
  padding: 0.875em 1em;

  &:focus {
    border-color: ${(props) =>
      props.error
        ? props.theme.colors.inputError
        : props.theme.colors.inputFocus};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholder};
  }
`;

export const TextAreaInput = styled.textarea<{ error: boolean }>`
  background-color: transparent;
  border-width: 2px;
  border-color: ${(props) =>
    props.error
      ? props.theme.colors.inputError
      : props.theme.colors.inputBorder};
  border-radius: 12px;
  border-style: solid;
  color: ${(props) => props.theme.colors.inputText};
  font-weight: 500;
  margin-top: 10px;
  padding: 1em;

  &:focus {
    border-color: ${(props) =>
      props.error
        ? props.theme.colors.inputError
        : props.theme.colors.inputFocus};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholder};
  }
`;

export const Label = styled.label`
  font-weight: 500;
  color: ${(props) => props.theme.colors.inputText};
`;

export const ErrorTooltip = styled.span`
  display: ${(props) => (props.children ? "inline-block" : "none")};
  font-size: 0.75em;
  color: ${(props) => props.theme.colors.inputError};
  font-weight: 400;
`;

export const PasswordContainer = styled.div`
  position: relative;
  display: flex;
`;

export const IconContainer = styled.span`
  position: absolute;
  top: 38%;
  right: 16px;
  cursor: pointer;
`;

import { Icon, IconName } from "../Icon";
import React, { ChangeEventHandler, FocusEventHandler, useState } from "react";
import {
  ErrorTooltip,
  IconContainer,
  InputWrapper,
  Label,
  PasswordContainer,
  TextAreaInput,
  TextInput,
} from "./input.components";

import { InputVariant } from "./types";

export type InputProps = {
  variant?: InputVariant;
  value?: string | number;
  label?: string | React.ReactNode;
  error?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
};

export const Input = ({
  variant = InputVariant.Text,
  value = "",
  label,
  error,
  onChange,
  onFocus,
  placeholder,
}: InputProps): JSX.Element => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

  switch (variant) {
    case InputVariant.Text:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextInput
              error={!!error}
              onChange={onChange}
              onFocus={onFocus}
              placeholder={placeholder}
              value={value}
            />
            <br />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
    case InputVariant.Textarea:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextAreaInput error={!!error} onChange={onChange} value={value} />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
    case InputVariant.Password:
      return (
        <Label>
          {label}
          <PasswordContainer>
            <TextInput
              error={!!error}
              placeholder={placeholder}
              onChange={onChange}
              onFocus={onFocus}
              type={passwordShown ? "text" : "password"}
            />
            <IconContainer onClick={() => togglePasswordShown()}>
              <Icon
                iconName={passwordShown ? IconName.Eye : IconName.EyeHidden}
              />
            </IconContainer>
          </PasswordContainer>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
    case InputVariant.Number:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextInput
              error={!!error}
              placeholder={placeholder}
              type={"number"}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
            />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
  }
};

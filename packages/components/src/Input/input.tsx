import { Icon, IconName } from "../";
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
import { InputVariants } from "./types";

export type InputProps = {
  variant?: InputVariants;
  value?: string | number;
  label: string | React.ReactNode;
  error?: string;
  onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
};

export const Input = ({
  variant = InputVariants.Text,
  value = "",
  label,
  error,
  onChangeCallback,
  onFocus,
  placeholder,
}: InputProps): JSX.Element => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

  switch (variant) {
    case InputVariants.Text:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextInput
              error={!!error}
              onChange={onChangeCallback}
              onFocus={onFocus}
              placeholder={placeholder}
              value={value}
            />
            <br />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
    case InputVariants.Textarea:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextAreaInput
              error={!!error}
              onChange={onChangeCallback}
              value={value}
            />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
    case InputVariants.Password:
      return (
        <Label>
          {label}
          <PasswordContainer>
            <TextInput
              error={!!error}
              placeholder={placeholder}
              onChange={onChangeCallback}
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
    case InputVariants.Number:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextInput
              error={!!error}
              placeholder={placeholder}
              type={"number"}
              value={value}
              onChange={onChangeCallback}
              onFocus={onFocus}
            />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
  }
};

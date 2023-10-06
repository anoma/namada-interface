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
  autoFocus?: boolean;
  variant?: InputVariants;
  value?: string | number;
  label: string | React.ReactNode;
  error?: string;
  onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  step?: number;
  min?: number;
};

export const Input = ({
  autoFocus,
  variant = InputVariants.Text,
  value = "",
  label,
  error,
  onChangeCallback,
  onPaste,
  onFocus,
  placeholder,
  step,
  min,
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
              onPaste={onPaste}
              placeholder={placeholder}
              value={value}
              autoFocus={autoFocus}
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
              autoFocus={autoFocus}
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
              autoFocus={autoFocus}
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
    case InputVariants.PasswordOnBlur:
      return (
        <Label>
          {label}
          <InputWrapper>
            <TextInput
              error={!!error}
              onChange={onChangeCallback}
              onFocus={(e) => {
                setPasswordShown(true);
                onFocus && onFocus(e);
              }}
              onBlur={() => setPasswordShown(false)}
              onPaste={onPaste}
              placeholder={placeholder}
              value={value}
              autoFocus={autoFocus}
              type={passwordShown ? "text" : "password"}
            />
            <br />
          </InputWrapper>
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
              autoFocus={autoFocus}
              step={step}
              min={min}
            />
          </InputWrapper>
          <ErrorTooltip>{error}</ErrorTooltip>
        </Label>
      );
  }
};

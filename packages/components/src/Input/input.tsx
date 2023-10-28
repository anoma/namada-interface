import React, { ChangeEventHandler, useState } from "react";
import { Icon, IconName } from "@namada/components";
import {
  ErrorTooltip,
  HintTooltip,
  IconContainer,
  InputWrapper,
  Label,
  LabelWrapper,
  TextAreaInput,
  TextInput,
} from "./input.components";
import { InputVariants } from "./types";

export type InputProps = {
  variant?: InputVariants;
  label: string | React.ReactNode;
  error?: string;
  hint?: string | React.ReactNode;
  onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
} & React.ComponentPropsWithoutRef<"input">;

export const Input = ({
  variant = InputVariants.Text,
  label,
  error,
  hint,
  onChangeCallback,
  ...props
}: InputProps): JSX.Element => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

  let inputElement: React.ReactNode;

  switch (variant) {
    case InputVariants.Textarea:
      inputElement = (
        <TextAreaInput error={!!error} onChange={onChangeCallback} />
      );
      break;

    case InputVariants.Password:
      inputElement = (
        <InputWrapper>
          <TextInput
            type={passwordShown ? "text" : "password"}
            error={!!error}
            onChange={onChangeCallback}
            {...props}
          />
          <IconContainer onClick={() => togglePasswordShown()}>
            <Icon
              iconName={passwordShown ? IconName.Eye : IconName.EyeHidden}
            />
          </IconContainer>
        </InputWrapper>
      );
      break;

    case InputVariants.PasswordOnBlur:
      inputElement = (
        <TextInput
          type={passwordShown ? "text" : "password"}
          error={!!error}
          onChange={onChangeCallback}
          onBlur={() => setPasswordShown(false)}
          onFocus={(e) => {
            setPasswordShown(true);
            props.onFocus && props.onFocus(e);
          }}
          {...props}
        />
      );
      break;

    case InputVariants.Number:
      inputElement = (
        <TextInput
          type={"number"}
          error={!!error}
          onChange={onChangeCallback}
          {...props}
        />
      );
      break;

    default:
      inputElement = (
        <TextInput error={!!error} onChange={onChangeCallback} {...props} />
      );
      break;
  }

  return (
    <Label>
      <LabelWrapper>{label}</LabelWrapper>
      {inputElement}
      {<ErrorTooltip>{error}</ErrorTooltip>}
      {<HintTooltip>{hint}</HintTooltip>}
    </Label>
  );
};

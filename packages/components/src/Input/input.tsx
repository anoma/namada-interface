import React, { useState } from "react";

import { Icon, IconName, ContentMasker } from "@namada/components";

import { ComponentProps, InputProps, InputVariants } from "./types";
import {
  ErrorTooltip,
  HintTooltip,
  IconContainer,
  InputWrapper,
  Label,
  LabelWrapper,
  TextInput,
} from "./input.components";
import { CopyToClipboardControl } from "./CopyToClipboardControl/CopyToClipboardControl";

type Props = ComponentProps & InputProps & { variant?: InputVariants };

export const Input = ({
  variant = InputVariants.Text,
  label,
  error,
  hint,
  theme,
  hideIcon = false,
  sensitive = false,
  children,
  ...props
}: Props): JSX.Element => {
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

  let inputElement: InputProps = {};
  let icon: React.ReactNode | null = null;

  switch (variant) {
    case InputVariants.Password:
      inputElement = {
        ...props,
        type: passwordShown ? "text" : "password",
      };

      icon = (
        <IconContainer
          role="button"
          aria-labelledby={passwordShown ? "Hide password" : "Display password"}
          onClick={() => togglePasswordShown()}
        >
          <Icon iconName={passwordShown ? IconName.Eye : IconName.EyeHidden} />
        </IconContainer>
      );
      break;

    case InputVariants.ReadOnlyCopy:
      inputElement = {
        ...props,
        readOnly: true,
      };
      icon = <CopyToClipboardControl value={props.value?.toString() || ""} />;
      break;

    case InputVariants.PasswordOnBlur:
      inputElement = {
        ...props,
        type: passwordShown ? "text" : "password",
        onBlur: () => setPasswordShown(false),
        onFocus: () => setPasswordShown(true),
      };
      break;

    case InputVariants.Number:
      inputElement = {
        ...props,
        type: "number",
      };
      break;

    default:
      inputElement = { ...props };
      break;
  }

  const field = (
    <TextInput
      error={!!error}
      inputTheme={sensitive ? undefined : theme}
      hasIcon={!!icon}
      {...inputElement}
    />
  );

  return (
    <Label className={props.className}>
      {label && <LabelWrapper>{label}</LabelWrapper>}
      <InputWrapper>
        {sensitive ? (
          <ContentMasker themeColor={theme}>{field}</ContentMasker>
        ) : (
          field
        )}
        {!hideIcon && icon}
        {children}
      </InputWrapper>
      {<ErrorTooltip>{error}</ErrorTooltip>}
      {<HintTooltip>{hint}</HintTooltip>}
    </Label>
  );
};

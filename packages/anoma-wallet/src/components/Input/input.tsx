import { Icon, IconName } from "components/Icon";
import { ChangeEventHandler, useState } from "react";
import {
  ErrorTooltip,
  IconContainer,
  Label,
  PasswordContainer,
  TextAreaInput,
  TextInput,
} from "./input.components";
import { InputVariants } from "./types";

export type InputProps = {
  variant?: InputVariants;
  label: string;
  error?: string;
  onChangeCallback?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
};

export const Input = ({
  variant = InputVariants.Text,
  label,
  error,
  onChangeCallback,
  placeholder,
}: InputProps): JSX.Element => {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordShown = (): void => setPasswordShown(!passwordShown);

  switch (variant) {
    case InputVariants.Text:
      return (
        <Label>
          {label}
          <div>
            <TextInput
              error={!!error}
              onChange={onChangeCallback}
              placeholder={placeholder}
            />
            <br />
            <ErrorTooltip>{error}</ErrorTooltip>
          </div>
        </Label>
      );
    case InputVariants.Textarea:
      return (
        <Label>
          {label}
          <br />
          <TextAreaInput error={!!error} onChange={onChangeCallback} />
          <br />
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
  }
};

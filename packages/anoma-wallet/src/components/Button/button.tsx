/* eslint-disable max-len */
import {
  ContainedAltButton,
  ContainedButton,
  OutlinedButton,
  SmallButton,
} from "./button.components";
import { ButtonVariant } from "./types";

export type ButtonProps = {
  variant: ButtonVariant;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
  disabled?: boolean;
  tooltip?: string;
};
export const Button: React.FC<ButtonProps> = (props): JSX.Element => {
  const {
    variant = ButtonVariant.Contained,
    onClick,
    style,
    disabled,
    children,
    tooltip,
  } = props;
  switch (variant) {
    case ButtonVariant.Contained:
      return (
        <ContainedButton
          style={style}
          onClick={onClick}
          disabled={disabled}
          title={tooltip}
        >
          {children}
        </ContainedButton>
      );
    case ButtonVariant.ContainedAlternative:
      return (
        <ContainedAltButton
          style={style}
          onClick={onClick}
          disabled={disabled}
          title={tooltip}
        >
          {children}
        </ContainedAltButton>
      );
    case ButtonVariant.Outlined:
      return (
        <OutlinedButton
          style={style}
          onClick={onClick}
          disabled={disabled}
          title={tooltip}
        >
          {children}
        </OutlinedButton>
      );
    case ButtonVariant.Small:
      return (
        <SmallButton
          style={style}
          onClick={onClick}
          disabled={disabled}
          title={tooltip}
        >
          {children}
        </SmallButton>
      );
  }
};

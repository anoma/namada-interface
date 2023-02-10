/* eslint-disable max-len */
import {
  ButtonContent,
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
  className?: string;
  loading?: boolean;
};
export const Button: React.FC<ButtonProps> = (props): JSX.Element => {
  const {
    variant = ButtonVariant.Contained,
    onClick,
    style,
    className,
    disabled,
    children,
    tooltip,
    loading,
  } = props;

  const guardedClick = !loading ? onClick : undefined;

  switch (variant) {
    case ButtonVariant.Contained:
      return (
        <ContainedButton
          className={loading ? "loading" : ""}
          style={style}
          onClick={guardedClick}
          disabled={disabled}
          title={tooltip}
        >
          <ButtonContent>{children}</ButtonContent>
        </ContainedButton>
      );
    case ButtonVariant.ContainedAlternative:
      return (
        <ContainedAltButton
          style={style}
          onClick={guardedClick}
          disabled={disabled}
          title={tooltip}
          className={className ? className : ""}
        >
          {children}
        </ContainedAltButton>
      );
    case ButtonVariant.Outlined:
      return (
        <OutlinedButton
          style={style}
          onClick={guardedClick}
          disabled={disabled}
          title={tooltip}
          className={className ? className : ""}
        >
          {children}
        </OutlinedButton>
      );
    case ButtonVariant.Small:
      return (
        <SmallButton
          style={style}
          onClick={guardedClick}
          disabled={disabled}
          title={tooltip}
        >
          {children}
        </SmallButton>
      );
  }
};

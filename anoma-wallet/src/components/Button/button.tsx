import { CSSProperties } from "styled-components";
import {
  ButtonContainer,
  ButtonContainerText,
  ButtonContainerOutline,
} from "./button.components";

export enum Variant {
  regular,
  text,
  outline,
}

export type ButtonProps = {
  // cb for when clicked
  onClick: () => void;
  onHover?: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: CSSProperties;
  children?: React.ReactNode;
};

/**
 * a component to indicate true/false
 */
const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps) => {
  const {
    onClick,
    onHover = () => {
      return;
    },
    variant,
    children,
    style,
    disabled,
  } = props;

  const ButtonVariant =
    variant === Variant.text
      ? ButtonContainerText
      : variant === Variant.outline
      ? ButtonContainerOutline
      : ButtonContainer;

  return (
    <ButtonVariant
      role="button"
      onClick={() => {
        onClick();
      }}
      onMouseEnter={() => {
        onHover();
      }}
      style={style}
      disabled={disabled}
    >
      {children}
    </ButtonVariant>
  );
};

export default Button;

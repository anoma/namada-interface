import { CSSProperties } from "styled-components";
import { ButtonContainer } from "./button.components";

export type ButtonProps = {
  // cb for when clicked
  onClick: () => void;
  onHover?: () => void;
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
    children,
    style,
    disabled,
  } = props;

  return (
    <ButtonContainer
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
    </ButtonContainer>
  );
};

export default Button;

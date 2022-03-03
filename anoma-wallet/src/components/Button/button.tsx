import { CSSProperties } from "styled-components";
import { ButtonContainer } from "./button.components";

export type ButtonProps = {
  // cb for when clicked
  onClick: () => void;
  style?: CSSProperties;
  children?: React.ReactNode;
};

/**
 * a component to indicate true/false
 */
const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps) => {
  const { onClick, children, style } = props;

  return (
    <ButtonContainer
      role="button"
      onClick={() => {
        onClick();
      }}
      style={style}
    >
      {children}
    </ButtonContainer>
  );
};

export default Button;

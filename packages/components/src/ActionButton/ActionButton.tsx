import { ThemeColor } from "@namada/utils";
import {
  ButtonContainer,
  ButtonHover,
  ButtonSize,
  ButtonText,
} from "./ActionButton.components";

type ActionButtonProps<HtmlTag extends keyof JSX.IntrinsicElements> = {
  as?: HtmlTag;
  variant?: ThemeColor;
  size?: ButtonSize;
  outlined?: boolean;
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const ActionButton = ({
  children,
  variant = "primary",
  size = "xl",
  as = "button",
  outlined = false,
  ...props
}: ActionButtonProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  return (
    <ButtonContainer
      outlined={outlined}
      size={size}
      variant={variant}
      as={as}
      {...props}
    >
      <ButtonText>{children}</ButtonText>
      <ButtonHover />
    </ButtonContainer>
  );
};

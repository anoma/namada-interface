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
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const ActionButton = ({
  children,
  variant = "primary",
  size = "xl",
  as = "button",
  ...props
}: ActionButtonProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  return (
    <ButtonContainer size={size} variant={variant} as={as} {...props}>
      <ButtonText>{children}</ButtonText>
      <ButtonHover />
    </ButtonContainer>
  );
};

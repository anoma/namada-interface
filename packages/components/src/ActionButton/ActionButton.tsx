import { BorderRadius, ThemeColor } from "@namada/utils";
import {
  ButtonContainer,
  ButtonHover,
  ButtonIcon,
  ButtonSize,
  ButtonText,
} from "./ActionButton.components";

type ActionButtonProps<HtmlTag extends keyof JSX.IntrinsicElements> = {
  as?: HtmlTag;
  variant?: ThemeColor;
  size?: ButtonSize;
  outlined?: boolean;
  borderRadius?: keyof BorderRadius;
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const ActionButton = ({
  children,
  variant = "primary",
  size = "xl",
  borderRadius = "md",
  as = "button",
  outlined = false,
  icon,
  ...props
}: ActionButtonProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  return (
    <ButtonContainer
      outlined={outlined}
      borderRadius={borderRadius}
      size={size}
      variant={variant}
      as={as}
      {...props}
    >
      {icon && <ButtonIcon>{icon}</ButtonIcon>}
      <ButtonText>{children}</ButtonText>
      <ButtonHover />
    </ButtonContainer>
  );
};

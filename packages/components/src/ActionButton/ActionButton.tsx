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
  hoverColor?: ThemeColor;
  size?: ButtonSize;
  outlined?: boolean;
  borderRadius?: keyof BorderRadius;
  icon?: React.ReactNode;
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const ActionButton = ({
  as = "button",
  variant = "primary",
  size = "xl",
  borderRadius = "md",
  outlined = false,
  hoverColor,
  icon,
  children,
  ...props
}: ActionButtonProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  return (
    <ButtonContainer
      outlined={outlined}
      hoverColor={hoverColor}
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

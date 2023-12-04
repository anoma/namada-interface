import { FontSize, ThemeColor } from "@namada/utils";
import { createElement } from "react";
import { LinkButtonContainer } from "./LinkButton.components";

type LinkButtonProps = {
  themeColor?: ThemeColor;
  size?: keyof FontSize;
  underline?: boolean;
} & React.ComponentPropsWithoutRef<"a">;

export const LinkButton = ({
  themeColor = "primary",
  size = "base",
  underline = true,
  children,
  ...props
}: LinkButtonProps): JSX.Element => {
  return (
    <LinkButtonContainer
      themeColor={themeColor}
      size={size}
      underline={underline}
    >
      {createElement(props.href ? "a" : "button", { ...props }, children)}
    </LinkButtonContainer>
  );
};

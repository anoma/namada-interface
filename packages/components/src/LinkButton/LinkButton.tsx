import { ThemeColor } from "@namada/utils";
import { createElement } from "react";
import { LinkButtonContainer } from "./LinkButton.components";

type LinkButtonProps = {
  themeColor?: ThemeColor;
} & React.ComponentPropsWithoutRef<"a">;

export const LinkButton = ({
  themeColor = "primary",
  children,
  ...props
}: LinkButtonProps): JSX.Element => {
  return (
    <LinkButtonContainer themeColor={themeColor}>
      {createElement(props.href ? "a" : "button", { ...props }, children)}
    </LinkButtonContainer>
  );
};

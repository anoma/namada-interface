import React from "react";
import styled from "styled-components";
import {
  Colors,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";

type ButtonProps = {
  forwardedAs: keyof JSX.IntrinsicElements;
} & React.ComponentPropsWithoutRef<"button">;

export type ButtonVariants = keyof Pick<
  Colors,
  "primary" | "secondary" | "utility1"
>;

const Button = ({
  children,
  forwardedAs,
  ...props
}: ButtonProps): JSX.Element => {
  return React.createElement(forwardedAs, props, children);
};

export const ButtonContainer = styled(Button)<{
  variant: ButtonVariants;
}>`
  all: unset;
  align-items: center;
  background-color: ${(props) => color(props.variant, "main")(props)};
  border-radius: ${borderRadius("md")};
  box-sizing: border-box;
  color: ${(props) => color(props.variant, "main20")(props)};
  cursor: pointer;
  display: flex;
  font-size: ${fontSize("xl")};
  font-weight: 500;
  justify-content: center;
  min-height: 56px;
  user-select: none;
  padding: ${spacement(3)} ${spacement(6)};
  position: relative;
  text-align: center;
  width: 100%;
  transition: all 100ms ease-out;

  &:not([disabled]):active {
    top: ${spacement("px")};
  }

  &[disabled] {
    background-color: ${color("utility1", "main50")};
    color: ${color("utility3", "white")};
    opacity: 0.25;
    cursor: auto;
  }
`;

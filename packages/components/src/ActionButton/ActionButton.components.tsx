import {
  BorderRadius,
  FontSize,
  ThemeColor,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";

import React from "react";
import styled from "styled-components";

type ButtonProps = {
  forwardedAs: keyof JSX.IntrinsicElements;
} & React.ComponentPropsWithoutRef<"button">;

export type ButtonSize = keyof Pick<FontSize, "xl" | "base" | "sm" | "xs">;

const Button = ({
  children,
  forwardedAs,
  ...props
}: ButtonProps): JSX.Element => {
  return React.createElement(forwardedAs, props, children);
};

export const ButtonText = styled.span`
  color: currentColor;
  height: 500%;
  position: relative;
  z-index: 10;
`;

export const ButtonContainer = styled(Button) <{
  variant: ThemeColor;
  hoverColor?: ThemeColor;
  size: ButtonSize;
  outlined: boolean;
  borderRadius: keyof BorderRadius;
}>`
  all: unset;
  background-image: ${(props) => {
    if (props.disabled && !props.outlined) {
      return `linear-gradient(${color(
        "utility1",
        "main50"
      )(props)} 50%, ${color("utility1", "main50")(props)} 50%)`;
    }

    if (props.outlined) {
      // main color is transparent, filler color is yellow
      return `linear-gradient(transparent 50%, ${color(
        props.hoverColor || "primary",
        "main"
      )(props)} 50%)`;
    }

    if (props.hoverColor) {
      // main color is yellow, filler color is {hoverColor}
      return `linear-gradient(${color(
        props.variant,
        "main"
      )(props)} 50%, ${color(props.hoverColor, "main")(props)} 50%)`;
    }

    // main color is yellow, filler color is black
    return `linear-gradient(${color(
      props.variant,
      "main"
    )(props)} 50%, black 50%)`;
  }};
  background-size: 100% 220%;

  border: ${(props) => {
    if (props.outlined) {
      return "1px solid currentColor";
    }
    return "";
  }};

  color: ${(props) => {
    if (props.outlined) {
      return color(props.variant, "main")(props);
    }

    return color(props.variant, "main20")(props);
  }};

  align-items: center;
  border-radius: ${(props) => borderRadius(props.borderRadius)(props)};
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  font-size: ${(props) => fontSize(props.size)(props)};
  font-weight: 500;
  justify-content: center;
  min-height: 2em;
  overflow: hidden;
  padding: 0.75em ${spacement(6)};
  position: relative;
  text-align: center;
  transition: color 80ms ease-out, border 450ms ease-out;
  user-select: none;
  width: 100%;
  transition: background-position var(--ease-out-circ) 0.45s,
    color var(--ease-out-circ) 0.45s;

  &:hover:not(:disabled) {
    background-position: 0 100%;
    color: ${(props) => {
    if (props.outlined) {
      return color(props.variant, "main20")(props);
    }

    if (props.hoverColor) {
      return color(props.hoverColor, "main20")(props);
    }

    return color(props.variant, "main")(props);
  }};
  }

  &:not(:disabled):active {
    top: ${spacement("px")};
  }

  &:disabled {
    color: ${(props) => {
    if (!props.outlined) {
      return color("utility3", "white");
    }
  }};

    cursor: auto;
    opacity: 0.25;
  }
`;

export const ButtonIcon = styled.i`
  align-items: center;
  display: flex;
  justify-content: center;
  left: ${spacement(3)};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: ${spacement(6)};
  z-index: 40;
`;

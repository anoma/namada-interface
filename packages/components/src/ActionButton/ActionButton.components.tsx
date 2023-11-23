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
import { motion } from "framer-motion";

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

export const ButtonHover = styled(motion.i)`
  display: block;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  transform-origin: center center;
  transform: translateY(calc(100% + 2px));
  transition: all var(--ease-out-circ) 0.45s;
  width: 100%;
`;

export const ButtonText = styled.span`
  color: currentColor;
  height: 500%;
  position: relative;
  z-index: 10;
`;

export const ButtonContainer = styled(Button)<{
  variant: ThemeColor;
  size: ButtonSize;
  outlined: boolean;
  borderRadius: keyof BorderRadius;
}>`
  align-items: center;
  all: unset;

  background-color: ${(props) => {
    if (props.outlined) {
      return "transparent";
    }
    return color(props.variant, "main")(props);
  }};

  border: ${(props) => {
    if (props.outlined) {
      return "1px solid currentColor";
    }
    return "";
  }};

  border-radius: ${(props) => borderRadius(props.borderRadius)(props)};
  box-sizing: border-box;

  color: ${(props) => {
    if (props.outlined) {
      return color(props.variant, "main")(props);
    }
    return color(props.variant, "main20")(props);
  }};

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
  user-select: none;
  width: 100%;
  transition: color 80ms ease-out, border 450ms ease-out;

  &:hover:not(:disabled) {
    color: ${(props) => {
      if (props.outlined) {
        return color(props.variant, "main20")(props);
      }
      return color(props.variant, "main")(props);
    }};
  }

  &:not(:disabled):active {
    top: ${spacement("px")};
  }

  &:disabled {
    background-color: ${(props) => {
      if (!props.outlined) {
        return color("utility1", "main50");
      }
    }};

    color: ${(props) => {
      if (!props.outlined) {
        return color("utility3", "white");
      }
    }};

    cursor: auto;
    opacity: 0.25;
  }

  ${ButtonHover} {
    background-color: ${(props) => {
      if (props.outlined) {
        return color("primary", "main")(props);
      }
      return "black";
    }};
  }

  &:hover:not(:disabled) ${ButtonHover} {
    transform: translateY(0);
  }
`;

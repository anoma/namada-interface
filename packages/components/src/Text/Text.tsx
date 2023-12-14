import { FontSize, ThemeColor } from "@namada/utils";
import React from "react";
import { FontWeight } from "../types";
import { TextParagraph } from "./Text.components";

export type TextProps = {
  children: React.ReactNode;
  fontSize?: keyof FontSize;
  themeColor?: ThemeColor;
  fontWeight?: FontWeight;
  className?: string;
};

export const Text = ({
  fontSize = "base",
  themeColor = "utility2",
  fontWeight = "500",
  children,
  className,
}: TextProps): JSX.Element => {
  return (
    <TextParagraph
      className={className}
      fontSize={fontSize}
      themeColor={themeColor}
      fontWeight={fontWeight}
    >
      {children}
    </TextParagraph>
  );
};

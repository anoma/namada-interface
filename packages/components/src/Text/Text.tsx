import { FontSize, ThemeColor } from "@namada/utils";
import React from "react";
import { TextParagraph } from "./Text.components";
import { FontWeight } from "../types";

type TextProps = {
  children: React.ReactNode;
  fontSize?: keyof FontSize;
  themeColor?: ThemeColor;
  fontWeight?: FontWeight;
};

export const Text = ({
  fontSize = "base",
  themeColor = "utility2",
  fontWeight = "500",
  children,
}: TextProps): JSX.Element => {
  return (
    <TextParagraph
      fontSize={fontSize}
      themeColor={themeColor}
      fontWeight={fontWeight}
    >
      {children}
    </TextParagraph>
  );
};

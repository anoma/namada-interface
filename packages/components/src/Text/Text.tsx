import { FontSize, ThemeColor } from "@namada/utils";
import React from "react";
import { TextParagraph } from "./Text.components";

type TextProps = {
  children: React.ReactNode;
  fontSize?: keyof FontSize;
  themeColor?: ThemeColor;
};

export const Text = ({
  fontSize = "base",
  themeColor = "utility2",
  children,
}: TextProps): JSX.Element => {
  return (
    <TextParagraph fontSize={fontSize} themeColor={themeColor}>
      {children}
    </TextParagraph>
  );
};

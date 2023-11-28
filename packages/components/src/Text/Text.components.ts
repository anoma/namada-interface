import { FontSize, ThemeColor, color, fontSize } from "@namada/utils";
import styled from "styled-components";
import { FontWeight } from "../types";

export const TextParagraph = styled.p<{
  fontSize?: keyof FontSize;
  themeColor?: ThemeColor;
  fontWeight?: FontWeight;
}>`
  color: ${(props) => color(props.themeColor || "utility1", "main")(props)};
  font-size: ${(props) => fontSize(props.fontSize || "base")(props)};
  font-weight: ${(props) => props.fontWeight || "500"};
  margin: 0;
  padding: 0;
`;

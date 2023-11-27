import styled from "styled-components";
import { FontSize, ThemeColor, color, fontSize } from "@namada/utils";

export const BaseHeading = styled.h1<{
  size: keyof FontSize;
  themeColor: ThemeColor;
  uppercase?: boolean;
  textAlign?: "center" | "left" | "right";
}>`
  color: ${(props) => color(props.themeColor, "main")(props)};
  font-size: ${(props) => fontSize(props.size)(props)};
  font-weight: 500;
  text-align: ${(props) => props.textAlign};
  text-transform: ${(props) => (props.uppercase ? "uppercase" : "none")};
  margin: 0;
  padding: 0;
  text-wrap: balance;
`;

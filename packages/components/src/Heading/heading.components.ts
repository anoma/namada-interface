import styled from "styled-components";
import { FontSize, ThemeColor, color, fontSize } from "@namada/utils";

export const BaseHeading = styled.h1<{
  size: keyof FontSize;
  themeColor: ThemeColor;
  uppercase?: boolean;
}>`
  color: ${(props) => color(props.themeColor, "main")(props)};
  font-size: ${(props) => fontSize(props.size)(props)};
  font-weight: 500;
  text-align: center;
  text-transform: ${(props) => (props.uppercase ? "uppercase" : "none")};
  margin: 0;
  padding: 0;
  text-wrap: balance;
`;

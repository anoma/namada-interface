import styled from "styled-components";
import { FontSize, ThemeColor, color, fontSize } from "@namada/utils";

export const BaseHeading = styled.h1<{
  size: keyof FontSize;
  themeColor: ThemeColor;
}>`
  color: ${(props) => color(props.themeColor, "main")(props)};
  font-size: ${(props) => fontSize(props.size)(props)};
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  margin: 0;
  padding: 0;
`;

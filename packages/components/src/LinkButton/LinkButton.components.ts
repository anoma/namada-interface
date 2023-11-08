import { ThemeColor, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const LinkButtonContainer = styled.div<{ themeColor: ThemeColor }>`
  color: ${(props) => color(props.themeColor, "main")(props)};
  font-size: ${fontSize("base")};
  padding-bottom: ${spacement(1)};
  text-align: center;
  display: inline-block;

  button {
    all: unset;
    cursor: pointer;
  }

  a {
    text-decoration: none;
  }

  button,
  a {
    border-bottom: 1px solid currentColor;
  }
`;

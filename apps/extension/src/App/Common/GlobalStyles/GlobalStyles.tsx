import { color } from "@namada/utils";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${color("utility1", "main70")};
  }
`;

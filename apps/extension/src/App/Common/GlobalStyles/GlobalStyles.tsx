import { color } from "@namada/utils";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${color("utility1", "main70")};
    min-width: 360px;
    height: 600px;
    overflow-x: hidden;
  }

  body::-webkit-scrollbar {
    width: 0.25rem;
  }

  body::-webkit-scrollbar-track {
    box-shadow: inset 0 0 6px black;
  }

  body::-webkit-scrollbar-thumb {
    background-color: ${color("utility1", "main50")};
    outline: 0;
  }

`;

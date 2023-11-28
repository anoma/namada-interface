import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const TOSToggle = styled.label`
  cursor: pointer;
  display: grid;
  grid-template-columns: ${spacement(8)} auto;
  align-items: start;
  font-size: ${fontSize("sm")};
  color: ${color("primary", "main")};
  gap: ${spacement(2)};

  > span {
    margin-top: 0.25em;
  }
`;

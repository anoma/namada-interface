import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const TOSToggle = styled.label<{ disabled?: boolean }>`
  cursor: pointer;
  display: grid;
  grid-template-columns: ${spacement(8)} auto;
  align-items: start;
  font-size: ${fontSize("sm")};
  color: ${(props) => color("primary", props.disabled ? "main40" : "main")};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  gap: ${spacement(2)};

  > span {
    margin-top: 0.25em;
  }
`;

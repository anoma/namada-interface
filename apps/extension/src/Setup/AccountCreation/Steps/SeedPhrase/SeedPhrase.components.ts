import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const CopyToClipboard = styled.a`
  border-radius: 4px;
  color: ${color("primary", "main")};
  padding: 5px;
  position: relative;
  text-align: center;
  text-decoration: underline;

  &:active {
    top: ${spacement("px")};
  }
`;

import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const LogoContainer = styled.div`
  max-width: ${spacement(42)};
  margin: 0 auto;
`;

export const HeaderContainer = styled.header``;

export const ReturnIcon = styled.span`
  align-items: center;
  color: ${color("utility1", "main")};
  cursor: pointer;
  display: flex;
  height: 100%;
  left: ${spacement(4)};
  position: absolute;
  top: 0;
  transition: color 150ms ease-out;

  &:hover {
    color: ${color("utility1", "main20")};
  }

  &:active {
    top: ${spacement("px")};
  }
`;

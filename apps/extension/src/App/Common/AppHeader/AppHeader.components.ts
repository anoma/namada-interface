import { color, spacement } from "@namada/utils";
import styled, { css } from "styled-components";

export const LogoContainer = styled.div`
  max-width: ${spacement(42)};
  margin: 0 auto;
`;

export const HeaderStyles = css`
  align-items: center;
  color: ${color("utility1", "main")};
  cursor: pointer;
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  transition: color 150ms ease-out;

  &:active {
    top: ${spacement("px")};
  }
`;

export const HeaderContainer = styled.header``;

export const LockContainer = styled.span`
  ${HeaderStyles}
  color: ${color("primary", "main")};
  left: ${spacement(7)};

  &:hover {
    color: ${color("secondary", "main")};
  }
`;

export const SettingsButton = styled.span`
  ${HeaderStyles}
  color: ${color("primary", "main")};
  right: ${spacement(7)};

  &:hover {
    color: ${color("secondary", "main")};
  }
`;

export const ReturnIcon = styled.span`
  ${HeaderStyles}
  color: ${color("primary", "main")};
  left: ${spacement(7)};

  &:hover {
    color: ${color("secondary", "main")};
  }
`;

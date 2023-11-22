import { color, spacement } from "@namada/utils";
import styled, { css } from "styled-components";

export const LogoContainer = styled.div`
  max-width: ${spacement(42)};
  margin: 0 auto;
`;

export const HeaderIconStyles = css`
  align-items: center;
  color: ${color("primary", "main")};
  cursor: pointer;
  display: flex;
  height: 100%;
  position: absolute;
  top: 0;
  transition: color 150ms ease-out;
  width: ${spacement(5)};

  &:active {
    top: ${spacement("px")};
  }

  &:hover {
    color: ${color("secondary", "main")};
  }
`;

export const HeaderContainer = styled.header``;

export const LockContainer = styled.span`
  ${HeaderIconStyles}
  width: 18px;
  left: ${spacement(7)};
`;

export const SettingsButton = styled.span`
  ${HeaderIconStyles}
  right: ${spacement(7)};
`;

export const ReturnIcon = styled.span`
  ${HeaderIconStyles}
  left: ${spacement(7)};
`;

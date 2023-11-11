import { color, fontSize, spacement } from "@namada/utils";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

export const NavigationPanel = styled.nav<{ open: boolean }>`
  background: ${color("primary", "main")};
  height: 100%;
  padding: ${spacement(16)} ${spacement(6)} ${spacement(8)};
  position: fixed;
  right: 0;
  top: 0;
  transform: ${(props) => (props.open ? `translateX(0)` : `translateX(100%)`)};
  transition: all 600ms var(--ease-out-expo);
  width: 65%;
  z-index: 50;
`;

export const NavigationPanelOverlay = styled.div`
  animation: ${fadeIn} 0.7s var(--ease-out-expo);
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 40;

  &:last-child {
    align-self: flex-end;
  }
`;

export const NavigationItem = styled.li`
  color: ${color("primary", "main40")};
  cursor: pointer;
  font-size: ${fontSize("2xl")};
  position: relative;
  transition: color 100ms ease-out;
  user-select: none;

  &:active {
    top: ${spacement("px")};
  }

  &:hover {
    color: ${color("utility1", "main")};
  }
`;

export const CloseNavigationIcon = styled.i`
  color: ${color("primary", "main40")};
  cursor: pointer;
  font-size: 1.85em;
  font-style: normal;
  line-height: 0;
  padding: ${spacement(8)} ${spacement(5)};
  position: absolute;
  right: 0;
  top: 0;
  transition: color 100ms ease-out;
  user-select: none;

  &:hover {
    color: ${color("utility1", "main")};
  }

  &:active {
    top: 1px;
  }
`;

export const NavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  justify-content: space-between;
`;

export const IconContainer = styled.a`
  color: ${color("utility1", "main")};
  transition: color 100ms ease-out;
  &:hover {
    color: ${color("secondary", "main")};
  }

  ul {
    align-items: center;
  }
`;

export const Footer = styled.footer`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

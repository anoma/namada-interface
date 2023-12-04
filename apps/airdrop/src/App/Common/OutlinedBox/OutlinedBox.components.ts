import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const StyledArticle = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 185px;
  padding: ${spacement(5)} ${spacement(8)};
  gap: ${spacement(7)};
  border-radius: 8px;
  box-sizing: border-box;
  transition: all 150ms ease-out;

  &:hover {
    background-color: black;
    color: ${color("primary", "main")};
  }
`;

export const StyledHeader = styled.header`
  text-transform: uppercase;
  font-weight: light;
`;

export const StyledContent = styled.div`
  line-height: 1.5;
  flex: 1;
  font-weight: 300;
`;

export const StyledFooter = styled.footer`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

export const StyledSpan = styled.span`
  text-transform: uppercase;
  font-size: 1.6rem;
`;

export const StyledIcon = styled.i`
  font-size: 1.6rem;
  align-self: flex-end;
  width: ${spacement(7)};
`;

export const StyledLink = styled.a`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transition: all 0.3s;
`;

export const HorizontalLine = styled.i<{
  isHidden?: boolean;
  position: "bottom" | "top";
}>`
  position: absolute;
  height: 1px;
  width: calc(100% - 20px);
  background-color: currentColor;
  left: 10px;

  ${({ isHidden }) => isHidden && "display: none;"}
  ${({ position }) => (position === "bottom" ? "bottom: -1px;" : "top: -1px;")}
`;

export const VerticalLine = styled.i<{
  isHidden?: boolean;
  position: "left" | "right";
}>`
  position: absolute;
  width: 1px;
  height: calc(100% - 20px);
  background-color: currentColor;
  bottom: 10px;
  ${({ isHidden }) => isHidden && "display: none;"}
  ${({ position }) => (position === "left" ? "left: -1px;" : "right: -1px;")}
`;

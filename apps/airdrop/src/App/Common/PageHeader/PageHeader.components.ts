import { ThemeColor, color, spacement } from "@namada/utils";
import { StartOver } from "App/Icons/StartOver";
import styled from "styled-components";

export const PageHeaderContainer = styled.header<{ themeColor: ThemeColor }>`
  padding: ${spacement(8)} ${spacement(24)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${(props) => color(props.themeColor, "main")};
`;

export const PageHeaderLink = styled.a`
  font-weight: 500;
  color: currentColor;
  display: flex;
  align-items: center;
  gap: ${spacement(4)};
  cursor: pointer;
  text-decoration: none;
`;

export const PageHeaderStartOver = styled(StartOver)<{
  themeColor: ThemeColor;
}>`
  & path {
    fill: ${(props) => color(props.themeColor, "main")};
  }
`;

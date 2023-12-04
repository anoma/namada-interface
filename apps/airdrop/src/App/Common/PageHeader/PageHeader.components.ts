import { ThemeColor, borderRadius, color, spacement } from "@namada/utils";
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

export const DomainWarning = styled.div`
  font-size: 13px;
  font-weight: 400;
  border: 1px solid ${color("utility1", "main")};
  border-radius: ${borderRadius("sm")};
  padding: ${spacement(1)} ${spacement(2)};
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${color("primary", "main")};
  top: ${spacement(28)};
  z-index: 100;

  i {
    display: inline-block;
    width: ${spacement(5)};
    vertical-align: middle;
    margin-right: ${spacement(2)};
  }

  .exclamationPoint {
    fill: ${color("primary", "main")};
  }

  .triangle {
    fill: ${color("utility1", "main")};
  }

  @media screen and (min-width: 1280px) {
    top: auto;
  }
`;

export const TermsOfServiceButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacement(4)};

  & > i {
    line-height: 0;
    width: 20px;
  }
`;

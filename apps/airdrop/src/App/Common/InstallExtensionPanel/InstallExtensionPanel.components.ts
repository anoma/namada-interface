import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const InstallExtensionTitle = styled.h3``;

export const InstallExtensionContent = styled.p``;

export const InstallExtensionContentWrapper = styled.div``;

export const InstallExtensionContainer = styled.div<{
  size?: "small" | "large";
}>`
  background-color: ${color("primary", "main")};
  border-radius: ${borderRadius("md")};
  display: flex;
  flex-direction: ${(props) => (props.size === "small" ? "column" : "row")};
  gap: ${(props) => (props.size === "small" ? spacement(4) : spacement(12))};

  padding: ${(props) => {
    if (props.size === "small") {
      return `${spacement(6)(props)} ${spacement(6)(props)}`;
    }

    if (props.size === "large") {
      return `${spacement(9)(props)} ${spacement(24)(props)}`;
    }
  }};

  button {
    color: ${color("primary", "main")};
  }

  ${InstallExtensionTitle} {
    margin: 0;
    padding: 0;
    line-height: 1.1;
    font-weight: ${(props) => (props.size === "small" ? 500 : 400)};
    font-size: ${(props) =>
      props.size === "small" ? fontSize("2xl") : fontSize("5xl")};
    width: 100%;
  }

  ${InstallExtensionContent} {
    width: 100%;
    margin: 0 0 ${spacement(4)};
    font-weight: ${(props) => (props.size === "small" ? 400 : 500)};
  }

  ${InstallExtensionContentWrapper} {
    width: 100%;
  }
`;

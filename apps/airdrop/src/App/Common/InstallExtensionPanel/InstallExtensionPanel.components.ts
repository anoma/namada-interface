import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const InstallExtensionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacement(4)};
  background-color: ${color("primary", "main")};
  padding: ${spacement(6)} ${spacement(6)};
  border-radius: ${borderRadius("md")};

  button {
    color: ${color("primary", "main")};
  }
`;

export const InstallExtensionTitle = styled.h3`
  font-size: ${fontSize("2xl")};
  margin: 0;
  padding: 0;
`;

export const InstallExtensionContent = styled.p`
  font-size: ${fontSize("sm")};
  margin: 0;
`;

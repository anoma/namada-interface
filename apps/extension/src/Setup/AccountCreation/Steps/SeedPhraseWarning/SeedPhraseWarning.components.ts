import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const WarningPanel = styled.aside`
  align-items: center;
  background-color: ${color("utility1", "main")};
  border-radius: ${borderRadius("md")};
  display: flex;
  justify-content: center;
  padding: ${spacement(14)};
  width: 100%;
`;

export const IconContainer = styled.div`
  max-width: ${spacement(32)};
  margin: 0 auto;
`;

export const InstructionsContainer = styled.div`
  font-size: ${fontSize("base")};
`;

export const PageFooter = styled.footer``;

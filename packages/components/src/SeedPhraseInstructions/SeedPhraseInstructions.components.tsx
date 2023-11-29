import styled from "styled-components";
import { borderRadius, color, spacement } from "@namada/utils";

export const InstructionPanel = styled.article`
  background-color: ${color("utility1", "main75")};
  border-radius: ${borderRadius("md")};
  padding: 1.75em 2.25em;
`;

export const WarningTip = styled.p`
  color: ${color("utility2", "main")};
  margin: 0 0 ${spacement(5)};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const WarningText = styled.span`
  display: block;
  font-size: 0.95em;
`;

export const WarningSummary = styled.strong`
  display: block;
  margin-bottom: ${spacement(1)};
  color: ${color("primary", "main")};
`;

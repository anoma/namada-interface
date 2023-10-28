import styled from "styled-components";
import { borderRadius, color, fontSize, spacement } from "@namada/utils";

export const InstructionPanel = styled.article`
  background-color: ${color("utility1", "main75")};
  border-radius: ${borderRadius("md")};
  padding: ${spacement(8)} ${spacement(11)};
  margin-bottom: ${spacement(8)};
`;

export const WarningTip = styled.p`
  color: ${color("utility2", "main")};
  font-size: ${fontSize("base")};
  margin: 0 0 ${spacement(5)};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const WarningSummary = styled.strong`
  display: block;
  margin-bottom: ${spacement(1)};
  color: ${color("primary", "main")};
`;

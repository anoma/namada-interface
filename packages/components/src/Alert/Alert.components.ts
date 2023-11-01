import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const AlertContainer = styled.div`
  border: 1px solid currentColor;
  border-radius: ${borderRadius("md")};
  font-size: ${fontSize("base")};
  font-weight: 400;
  padding: ${spacement(5)} ${spacement(4)};
`;

export const AlertError = styled(AlertContainer)`
  color: ${color("utility3", "highAttention")};
`;

export const AlertWarning = styled(AlertContainer)`
  color: ${color("primary", "main")};
  background-color: ${color("primary", "main20")};
`;

export const AlertInfo = styled(AlertContainer)``;

export const AlertSuccess = styled(AlertContainer)``;

export const AlertTitle = styled.strong`
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: ${spacement(2)};
`;

export const AlertContent = styled.div``;

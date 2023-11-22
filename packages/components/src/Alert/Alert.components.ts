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

export const AlertInfo = styled(AlertContainer)`
  background-color: ${color("utility1", "main80")};
  color: ${color("utility2", "main")};
  border: 0;
  font-weight: 500;
  padding-left: ${spacement(8)};
  padding-right: ${spacement(8)};

  & > strong {
    color: ${color("primary", "main")};
  }
`;

export const AlertSuccess = styled(AlertContainer)``;

export const AlertTitle = styled.strong`
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  font-size: ${fontSize("sm")};
  margin-bottom: ${spacement(2)};
`;

export const AlertContent = styled.div`
  font-size: 13px;
`;

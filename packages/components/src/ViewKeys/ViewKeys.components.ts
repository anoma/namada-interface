import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const DownloadPanel = styled.div`
  color: ${color("utility2", "main")};
  display: flex;
  flex-direction: column;
  font-size: ${fontSize("base")};
  font-weight: 500;
  gap: ${spacement(3)};
  text-align: center;
`;

export const WarningPanel = styled.aside`
  background-color: ${color("utility1", "main75")};
  border-radius: ${borderRadius("md")};
  color: ${color("utility2", "main")};
  font-weight: 500;
  font-size: ${fontSize("base")};
  line-height: 1.25;
  padding: ${spacement(5)} ${spacement(8)};

  p {
    margin: 0;
  }
`;

export const WarningPanelTitle = styled.strong`
  color: ${color("primary", "main")};
  display: block;
  font-weight: 600;
  margin-bottom: ${spacement(2)};
  text-transform: uppercase;
`;

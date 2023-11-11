import { borderRadius, color, spacement } from "@namada/utils";
import styled from "styled-components";

export const VerifyPanelContainer = styled.div`
  background-color: ${color("utility1", "main75")};
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: center;
  border-radius: ${borderRadius("md")};
  padding: ${spacement(4)} ${spacement(17)} ${spacement(7)};
  grid-gap: ${spacement(9)};
`;

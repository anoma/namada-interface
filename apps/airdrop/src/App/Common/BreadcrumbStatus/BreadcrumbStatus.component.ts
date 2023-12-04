import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const BreadcrumbStatusContainer = styled.span<{ active: boolean }>`
  color: ${color("primary", "main")};
  display: flex;
  gap: ${spacement(2)};
  align-items: center;
  opacity: ${(props) => (props.active ? "1" : "0.35")};
`;

export const BreadcrumbStatusIndicator = styled.span`
  display: flex;
  width: ${spacement(7)};
  height: ${spacement(7)};
  border-radius: 100%;
  background-color: ${color("primary", "main")};
  position: relative;
  align-items: center;
  justify-content: center;
`;

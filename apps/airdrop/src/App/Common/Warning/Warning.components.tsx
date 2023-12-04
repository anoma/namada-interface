import { borderRadius, color } from "@namada/utils";
import styled from "styled-components";

export const WarningIcon = styled.div<{ width?: string }>`
  width: ${(props) => props.width || "100%"};
  min-width: ${(props) => props.width || "100%"};
`;
export const WarningContent = styled.div``;

export const WarningContainer = styled.div<{
  orientation?: "horizontal" | "vertical";
}>`
  display: flex;
  flex-direction: ${(props) =>
    props.orientation === "vertical" ? "column" : "row"};
  border-radius: ${borderRadius("md")};
  align-items: center;
  color: ${color("primary", "main")};
  background-color: ${color("utility1", "main")};
`;

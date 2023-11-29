import { Sizing, spacement } from "@namada/utils";
import styled from "styled-components";

export const StackContainer = styled.div<{
  direction: "vertical" | "horizontal";
  full?: boolean;
  gap: keyof Sizing;
}>`
  display: flex;
  flex-direction: ${(props) =>
    props.direction === "vertical" ? "column" : "row"};
  gap: ${(props) => spacement(props.gap)(props)};
  list-style: none;
  padding: 0;
  margin: 0;
  list-style: none;
  height: ${(props) => (props.full ? "100%" : "auto")};
  flex: ${(props) => (props.full ? "1" : "")};
`;

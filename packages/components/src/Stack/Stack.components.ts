import { Sizing, spacement } from "@namada/utils";
import styled from "styled-components";

export const StackContainer = styled.div<{
  direction: "vertical" | "horizontal";
  gap: keyof Sizing;
}>`
  display: flex;
  flex-direction: ${(props) =>
    props.direction === "vertical" ? "column" : "row"};
  gap: ${(props) => spacement(props.gap)(props)};
  list-style: none;
  padding: 0;
  margin: 0;
`;

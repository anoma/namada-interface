import styled from "styled-components";
import { borderRadius, color, spacement } from "@namada/utils";

export const LedgerListItem = styled.li<{
  active: boolean;
  complete: boolean;
}>`
  align-items: center;
  border: 1px solid;
  border-color ${(props) =>
    props.active ? color("primary", "main")(props) : "transparent"};
  border-radius: ${borderRadius("md")};
  cursor: ${(props) => (props.complete ? "default" : "auto")};
  display: grid;
  grid-gap: ${spacement(5)};
  grid-template-columns: ${spacement(32)} auto;
  opacity: ${(props) => (props.complete ? "0.25" : 1)};
  padding: ${spacement(4)};
  transition: opacity 100ms ease-out, border-color 100ms ease-out;

  h2 {
    text-align: left;
  }
`;

export const LedgerIcon = styled.i`
  align-items: center;
  background-color: ${color("utility1", "main75")};
  border-radius: ${borderRadius("md")};
  display: flex;
  height: ${spacement(30)};
  justify-content: center;
  padding: ${spacement(4)} ${spacement(9)};
  width: 100%:
`;

export const LedgerText = styled.div``;

export const LedgerItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacement(1.5)};
`;

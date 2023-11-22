import { borderRadius, color, spacement } from "@namada/utils";
import styled from "styled-components";

export const DropdownContainer = styled.div``;

export const CheckboxContainer = styled.div``;

export const ItemContainer = styled.div<{ selected: boolean }>`
  align-items: center;
  background: ${color("utility1", "main")};
  border: 1px solid
    ${(props) =>
      props.selected ? color("primary", "main")(props) : "currentColor"};
  border-radius: ${borderRadius("md")};
  color: ${(props) =>
    props.selected
      ? color("primary", "main")(props)
      : color("utility2", "main")(props)};
  display: grid;
  font-size: 18px;
  font-weight: 500;
  grid-gap: ${spacement(8)};
  grid-template-columns: ${spacement(7)} auto ${spacement(2)};
  padding: ${spacement(5)} ${spacement(5)};
`;

export const Alias = styled.label``;

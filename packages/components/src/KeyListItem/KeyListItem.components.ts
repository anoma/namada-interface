import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const ItemContainer = styled.div`
  align-items: center;
  background: ${color("utility1", "main")};
  border: 1px solid ${color("primary", "main")};
  border-radius: ${borderRadius("md")};
  color: ${color("utility2", "main")};
  display: grid;
  font-size: ${fontSize("xl")};
  font-weight: 500;
  grid-gap: ${spacement(8)};
  grid-template-columns: ${spacement(7)} auto ${spacement(2)};
  padding: ${spacement(6)} ${spacement(5)};
`;

export const Alias = styled.label``;

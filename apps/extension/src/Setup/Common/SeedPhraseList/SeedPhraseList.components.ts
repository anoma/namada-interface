import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const SeedList = styled.ol<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, ${spacement(37)});
  grid-gap: ${spacement(2)};
  padding: 0;
  margin: 0;
  min-height: ${spacement(60)};
`;

export const SeedListItem = styled.li`
  background-color: ${color("utility1", "main")};
  border-radius: ${borderRadius("sm")};
  color: ${color("utility1", "main50")};
  font-size: ${fontSize("base")};
  font-weight: 300;
  list-style-position: inside;
  padding: ${spacement(5)} ${spacement(2.5)};
  position: relative;
`;

export const Word = styled.span`
  color: ${color("utility2", "main")};
  font-weight: 700;
  left: ${spacement(12)};
  position: absolute;
  top: 1.2em;
  user-select: none;
`;

export const WordInput = styled.span`
  position: absolute;
  left: 0;
  top: -${spacement(2)}; // 🫣
  width: 100%;
  height: 100%;

  input {
    background-color: transparent;
    padding-left: ${spacement(10)};
  }
`;

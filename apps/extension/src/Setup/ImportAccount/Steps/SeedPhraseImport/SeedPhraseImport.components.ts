import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const PhraseRecoveryContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
`;

export const InstructionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${spacement(1)};
  font-weight: 500;
  color: ${color("utility2", "main")};
  font-size: ${fontSize("base")};
  list-style: disc;
  margin: 0 0 ${spacement(12)};
  padding: 0 ${spacement(6)};
`;

export const Instruction = styled.li``;

import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const DropdownMenuContainer = styled.div`
  position: relative;
`;

export const OpenDropdownIcon = styled.i`
  cursor: pointer;
  color: ${color("primary", "main")};
`;

export const Dropdown = styled.ul<{ align: string }>`
  background-color: ${color("utility1", "main70")};
  border: 1px solid #363636;
  border-radius: ${borderRadius("md")};
  list-style: none;
  padding: 0 0 ${spacement(7)};
  margin: 0;
  position: absolute;
  right: -${spacement(2)};
  text-align: ${(props) => props.align};
  top: -${spacement(2)};
  width: ${spacement(63)};
  z-index: 20;
`;

export const DropdownItem = styled.li<{ disabled: boolean }>`
  border-bottom: 1px solid ${color("primary", "main60")};
  color: ${(props) =>
    props.disabled
      ? color("utility1", "main50")(props)
      : color("utility2", "main80")(props)};
  font-size: 18px;
  padding: ${spacement(3)} ${spacement(6)};
  cursor: pointer;
  transition: border-color 100ms ease-out;

  &:hover {
    border-color: ${color("primary", "main")};
    color: ${color("utility2", "main")};
  }
`;

export const DropdownOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  background: rgba(0, 0, 0, 0.15);
  width: 100%;
  height: 100%;
  z-index: 10;
  cursor: pointer;
`;

import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const DropdownMenuContainer = styled.div`
  position: relative;
`;

export const OpenDropdownIcon = styled.i`
  cursor: pointer;
  color: currentColor;
`;

export const Dropdown = styled.ul<{
  align: string;
  position: "top" | "bottom";
}>`
  background-color: ${color("utility1", "main70")};
  border: 1px solid #363636;
  border-radius: ${borderRadius("md")};
  list-style: none;
  padding: 0 0 ${spacement(7)};
  margin: 0;
  overflow: hidden;
  position: absolute;
  right: -${spacement(2)};
  text-align: ${(props) => props.align};
  top: -${(props) => (props.position === "top" ? spacement(2)(props) : "")};
  bottom: -${(props) => (props.position === "bottom" ? spacement(2)(props) : "")};
  width: ${spacement(55)};
  z-index: 20;
`;

export const DropdownItem = styled.li<{ disabled: boolean }>`
  border-bottom: 1px solid ${color("primary", "main60")};
  color: ${(props) =>
    props.disabled
      ? color("utility1", "main50")(props)
      : color("utility2", "main80")(props)};
  cursor: ${(props) => (props.disabled ? "default" : "pointer")};
  font-size: ${fontSize("base")};
  padding: ${spacement(3)} ${spacement(6)};
  transition: border-color 100ms ease-out;
  user-select: none;

  &:hover {
    background-color: ${(props) =>
      props.disabled ? null : color("primary", "main")(props)};

    color: ${(props) =>
      props.disabled ? null : color("utility1", "main")(props)};
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

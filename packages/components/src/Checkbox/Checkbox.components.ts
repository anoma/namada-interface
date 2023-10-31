import { borderRadius, color, spacement } from "@namada/utils";
import styled from "styled-components";

export const CheckboxContainer = styled.label`
  background-color: #000;
  border-radius: ${borderRadius("sm")};
  border: 1px solid ${color("primary", "main")};
  cursor: pointer;
  display: inline-flex;
  height: ${spacement(7)};
  padding: ${spacement(0.5)};
  position: relative;
  width: ${spacement(7)};

  &:hover > i {
    opacity: 0.5;
  }

  &:active {
    top: ${spacement("px")};
  }
`;

export const CheckboxInput = styled.input`
  position: absolute;
  visibility: hidden;

  &:checked + i {
    opacity: 1;
  }
`;

export const CheckboxControl = styled.i`
  align-items: center;
  background-color: #000;
  color: ${color("primary", "main")};
  display: inline-flex;
  justify-content: center;
  opacity: 0;
  transition: 150ms ease-out opacity;
`;

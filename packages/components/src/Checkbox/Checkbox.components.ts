import { borderRadius, spacement } from "@namada/utils";
import styled from "styled-components";

export const CheckboxContainer = styled.label<{ checked: boolean }>`
  background-color: #000;
  border-radius: ${borderRadius("sm")};
  border: 1px solid currentColor;
  cursor: pointer;
  display: inline-flex;
  height: ${spacement(6)};
  padding: ${spacement(0.5)};
  position: relative;
  width: ${spacement(6)};
  opacity: ${(props) => (props.checked ? 1 : 0.5)};

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
  color: currentColor;
  display: inline-flex;
  justify-content: center;
  opacity: 0;
  transition: 150ms ease-out opacity;
`;

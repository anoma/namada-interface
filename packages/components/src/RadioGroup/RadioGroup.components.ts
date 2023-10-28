import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const RadioGroupWrapper = styled.div`
  background-color: ${color("utility1", "main")};
  border-radius: 60px;
  padding: ${spacement(0.5)};
  overflow: hidden;
  display: inline-flex;
  margin: 0 auto;
`;

export const RadioGroupContainer = styled.fieldset`
  all: unset;
  display: flex;
  position: relative;
  width: 100%;
  height: 100%;
`;

export const RadioElementContainer = styled.div`
  color: ${color("utility1", "main60")};
  display: flex;
  min-width: ${spacement(30)};
  text-align: center;
`;

export const RadioLabel = styled.label`
  cursor: pointer;
  font-size: ${fontSize("sm")};
  font-weight: 700;
  padding: ${spacement(2)} ${spacement(6)};
  position: relative;
  width: 100%;

  &:active {
    top: ${spacement("px")};
  }
`;

export const RadioElement = styled.input.attrs({
  type: "radio",
})`
  all: unset;

  &:checked + span {
    color: ${color("utility2", "main")};
  }
`;

export const RadioText = styled.span`
  position: relative;
  transition: color 120ms ease-out;
  z-index: 10;
`;

export const ActiveIndicator = styled.span<{ left: string; width: string }>`
  background: ${color("utility1", "main70")};
  border-radius: 58px;
  height: 100%;
  left: ${(props) => props.left || "0px"};
  position: absolute;
  top: 0;
  transition: all 120ms ease-out;
  width: ${(props) => props.width || "0px"};
`;

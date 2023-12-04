import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const StepIndicatorContainer = styled.i`
  width: 2.25em;
  height: 2.25em;
  background-color: ${color("primary", "main")};
  border-radius: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${spacement(3)};
  font-style: normal;
  color: ${color("utility1", "main")};
  font-size: 0.8em;
`;

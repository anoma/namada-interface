import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const ContentMaskerContainer = styled.div`
  width: 100%;
  position: relative;
`;

export const BlurredContainer = styled.div`
  filter: blur(4px);
  transition: all 250ms ease-out;

  &:hover {
    filter: blur(0px);
  }
`;

export const EyeIcon = styled.i`
  color: ${color("primary", "main")};
  left: 50%;
  max-width: ${spacement(22)};
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  transition: opacity 150ms ease-out;
  width: 100%;

  ${ContentMaskerContainer}:hover & {
    opacity: 0;
  }
`;

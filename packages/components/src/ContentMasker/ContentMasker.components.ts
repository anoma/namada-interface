import { ThemeColor, borderRadius, color, spacement } from "@namada/utils";
import styled from "styled-components";

export const ContentMaskerContainer = styled.div<{ themeColor?: ThemeColor }>`
  width: 100%;
  position: relative;
  overflow: hidden;

  border: ${(props) =>
    props.themeColor
      ? `1px solid ${color(props.themeColor, "main")(props)}`
      : "0"};

  border-radius: ${(props) =>
    props.themeColor ? borderRadius("md")(props) : "0"};
`;

export const BlurredContainer = styled.div`
  display: flex;
  filter: blur(4px);
  transition: all 250ms ease-out;

  &:hover {
    filter: blur(0px);
  }
`;

export const EyeIcon = styled.i`
  color: ${color("primary", "main")};
  display: flex;
  height: 45%;
  justify-content: center;
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

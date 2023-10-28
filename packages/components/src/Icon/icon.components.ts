import styled from "styled-components";
import { IconSize } from "./types";

export const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledIcon = styled.div<{
  $iconSize: IconSize;
  $strokeOverride?: string;
  $fillColorOverride?: string;
}>`
  min-height: ${(props) => props.$iconSize};
  min-width: ${(props) => props.$iconSize};
  height: ${(props) => props.$iconSize};
  width: ${(props) => props.$iconSize};

  // if stroke is passed in we use it, otherwise default
  path {
    stroke: ${(props) =>
      props.$strokeOverride || props.theme.colors.primary.main80};
  }

  // if fill is passed in we use it
  ${(props) =>
    props.$fillColorOverride
      ? `path {
          fill: ${props.$fillColorOverride};}`
      : ``}
`;

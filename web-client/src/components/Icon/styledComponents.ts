import styled from "styled-components";

export const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const StyledIcon = styled.svg<{
  strokeColor?: string;
  fillColor?: string;
}>`
  // if stroke is passed in we use it, otherwise default
  path {
    stroke: ${(props) => props.strokeColor || props.theme.colors.textPrimary};
  }

  // if fill is passed in we use it
  ${(props) =>
    props.fillColor
      ? `path {
          fill: ${props.fillColor};}`
      : ``}
`;

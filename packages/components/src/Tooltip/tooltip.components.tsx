import styled from "styled-components";

export const TooltipText = styled.span`
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 105%;
  font-size: 0.8em;
`;

export const TooltipContainer = styled.span`
  position: relative;
  display: inline-block;
  &:hover ${TooltipText} {
    visibility: visible;
  }
`;

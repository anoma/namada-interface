import { Spinner } from "App/App.components";
import styled from "styled-components";

export const LoadingContainer = styled.div`
  &.is-loading::after {
    width: 32px;
    height: 32px;
    border: 4px solid transparent;
    margin: auto;
    ${Spinner}
  }
`;

export const LoadingError = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;

import styled from "styled-components";

export const LoadingContainer = styled.div`
  &.is-loading::after {
    content: "";
    position: absolute;
    width: 32px;
    height: 32px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 4px solid transparent;
    border-top-color: ${(props) => props.theme.colors.primary.main};
    border-radius: 50%;
    animation: button-loading-spinner 1s ease infinite;

    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }

      to {
        transform: rotate(1turn);
      }
    }
  }
`;

export const LoadingError = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;

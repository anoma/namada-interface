import styled, { css } from "styled-components";

export const Spinner = css`
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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

export const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const InfoLoader = styled.div`
  position: relative;
  width: 20px;
  height: 20px;

  &::after {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    ${Spinner}
  }
`;

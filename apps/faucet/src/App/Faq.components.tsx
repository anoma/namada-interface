import styled, { css, keyframes } from "styled-components";

export const FaqContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 64px;
`;

export const FaqDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 32px;
  padding: 16px 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.utility3.black};
  cursor: pointer;
  position: relative;
`;

const expand = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const FaqDropdownContent = styled.div`
  display: ${({ isOpen }: { isOpen: boolean }) => (isOpen ? "block" : "none")};
  margin: 16px 0;
  ${({ isOpen }) =>
    isOpen &&
    css`
      animation: ${expand} 0.65s ease-out;
    `}
`;

export const FaqUrl = styled.a`
  color: ${(props) => props.theme.colors.utility3.black};
`;

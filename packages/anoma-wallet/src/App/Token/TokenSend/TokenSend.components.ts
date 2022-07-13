import styled from "styled-components/macro";

export const TokenSendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 0;
`;

export const TokenSendTabsGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const TokenSendTab = styled.button`
  color: ${(props) => props.theme.colors.titleColor};
  background-color: ${(props) => props.theme.colors.background3};
  width: 100%;
  border: 0;
  padding: 8px 4px;

  &.active {
    background-color: ${(props) => props.theme.colors.background2};
  }
`;

export const TokenSendContent = styled.div`
  width: calc(100% - 80px);
  padding: 0 40px;
`;

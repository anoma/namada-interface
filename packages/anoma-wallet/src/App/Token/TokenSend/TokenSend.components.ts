import styled from "styled-components/macro";

export const TokenSendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const TokenSendTabsGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const TokenSendTab = styled.button`
  color: ${(props) => props.theme.colors.tabInactiveColor};
  background-color: ${(props) => props.theme.colors.tabInactiveBackground};
  width: 100%;
  border: 0;
  padding: 8px 4px;
  height: 78px;
  font-size: 18px;

  &.active {
    color: ${(props) => props.theme.colors.tabActiveColor};
    background-color: ${(props) => props.theme.colors.tabActiveBackground};
  }
`;

export const TokenSendContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;

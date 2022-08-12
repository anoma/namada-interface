import styled from "styled-components/macro";

export const TokenSendContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const TokenSendTabsGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  width: 100%;
`;

export const TokenSendTab = styled.button`
  background-color: ${(props) => props.theme.colors.utility1.main70};
  color: ${(props) => props.theme.colors.utility2.main60};
  width: 100%;
  border: 0;
  padding: 8px 4px;
  height: 78px;
  font-size: 18px;
  font-family: "Space Grotesk", sans-serif;
  cursor: pointer;

  &.active {
    cursor: default;
    color: ${(props) => props.theme.colors.utility2.main80};
    background-color: ${(props) => props.theme.colors.utility1.main80};
    color: ${(props) => props.theme.colors.secondary.main};
  }
`;

export const TokenSendContent = styled.div`
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;

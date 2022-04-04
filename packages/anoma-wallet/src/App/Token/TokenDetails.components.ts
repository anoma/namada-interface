import styled from "styled-components/macro";

export const TokenDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
`;

export const TransactionList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  width: 100%;
`;

export const TransactionListItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  font-size: 14px;

  & > div {
    flex: 1 0 70%;
  }

  & > button {
    flex: 1 0 20%;
  }
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

import styled from "styled-components/macro";

export const TransfersContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const TransactionList = styled.ul`
  margin: 0;
  padding: 0;
  list-style-type: none;
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
`;

export const TransactionListItem = styled.li`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  font-size: 14px;
  border-bottom: 1px solid #ddd;
  padding: 20px 0;

  & > div {
    flex: 1 0 70%;
  }

  & > button {
    flex: 1 0 20%;
    margin: 0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

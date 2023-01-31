import styled from "styled-components";

export const AccountsDetailsNavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0 0 0;
`;

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

export const SettingsButton = styled.button<{ disabled: boolean }>`
  margin: 0 8px 0 0;
  padding: 16px;
  border: none;
  background: none;

  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    background-color: ${(props) => (props.disabled ? "" : "#f7f7f7")};
  }
  & path {
    stroke-width: 2;
  }
  ${(props) =>
    props.disabled
      ? "cursor: initial; & path {stroke-width: 2;stroke: grey;}"
      : ""}
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;

  button {
    margin: 20px 0;
  }
`;

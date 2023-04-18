import styled from "styled-components";

export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 12px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;

  & > button {
    flex: 1;
  }
`;

export const ParentAccountsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 8px;
  width: 100%;
`;

export const ParentAccountsListItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;

  &:hover {
  }
`;

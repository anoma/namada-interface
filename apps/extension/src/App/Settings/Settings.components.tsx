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
  padding: 0;
  margin: 4px 0;
`;

export const ParentAccountDetails = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  font-family: "Space Grotesk", sans-serif;
  background-color: ${(props) => props.theme.colors.utility1.main};
  font-size: 11px;
  color: ${(props) => props.theme.colors.utility1.main40};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main};
  border-radius: 8px;
  box-sizing: border-box;
  padding: 8px 8px;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.utility1.main};
    background-color: ${(props) => props.theme.colors.utility2.main};
  }
`;

import { spacement } from "@namada/utils";
import styled from "styled-components";

export const SettingsContainer = styled.section`
  width: 100%;
`;

export const SettingsHeader = styled.nav`
  margin-top: ${spacement(4)};
  display: grid;
  grid-template-columns: auto ${spacement(30)};
  align-items: end;
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

export const ParentAccountsListItemContainer = styled.li`
  padding: 0;
  margin: 4px 0;
  display: flex;
  flex-direction: row;
`;

export const ParentAccountDetails = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
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

export const ParentAccountSideButton = styled.div`
  display: flex;
  flex-direction: row;
  width: 10%;
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
  text-align: center;

  &::before {
    content: "+";
    transform: translate(50%);
  }

  &:hover {
    color: ${(props) => props.theme.colors.utility1.main};
    background-color: ${(props) => props.theme.colors.utility2.main};
  }
`;

export const ModeSelectContainer = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  font-size: 11px;
`;

export const ModeSelectLink = styled.li`
  text-decoration: underline;
  padding: 5px;
  color: ${(props) => props.theme.colors.primary.main};
  transition: "1 sec";
  border-radius: 4px;

  &:active {
    border: 1px solid ${(props) => props.theme.colors.primary.main};
    color: ${(props) => props.theme.colors.utility2.main80};
    background-color: ${(props) => props.theme.colors.primary.main};
  }
`;

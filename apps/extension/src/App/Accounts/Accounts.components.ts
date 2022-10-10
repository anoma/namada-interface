import styled from "styled-components";

export const AccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
`;

export const AccountsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 8px;
  width: 100%;
`;

export const AccountsListItem = styled.li`
  padding: 2px 0;
  background-color: ${(props) => props.theme.colors.utility1.main80};
  color: ${(props) => props.theme.colors.utility1.main60};
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  box-sizing: border-box;
`;

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  justify-contents: start;
  align-items: center;
  cursor: pointer;
  color: ${(props) => props.theme.colors.utility1.main40};
  background-color: ${(props) => props.theme.colors.utility1.main};
  border: 1px solid ${(props) => props.theme.colors.utility1.main};
  border-radius: 8px;

  & > div > svg > path {
    fill: ${(props) => props.theme.colors.utility1.main40};
    stroke: ${(props) => props.theme.colors.utility1.main40};
  }
`;

export const ButtonText = styled.span`
  padding: 8px;
`;

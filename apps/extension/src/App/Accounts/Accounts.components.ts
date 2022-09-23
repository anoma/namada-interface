import styled from "styled-components";

export const AccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${(props) => props.theme.colors.utility1.main};
  box-sizing: border-box;
`;

export const AccountsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

export const AccountsListItem = styled.li`
  padding: 2px 4px;
  background-color: ${(props) => props.theme.colors.utility1.main80};
  color: ${(props) => props.theme.colors.utility1.main60};
`;

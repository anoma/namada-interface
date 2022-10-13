import styled from "styled-components";

export const AccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 400px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px;
  margin-bottom: 20px;
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

export const ThemedScrollbarContainer = styled.div`
  overflow-y: auto;

  /* Custom CSS Scrollbar for div containers*/
  /* NOTE - Firefox will only show max width on hover, otherwise is thin profile */
  scrollbar-width: 10px;
  scrollbar-color: ${(props) => props.theme.colors.primary.main};

  &::-webkit-scrollbar {
    height: 12px;
    width: 10px;
    background: transparent;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.primary.main};
    border-radius: 1ex;
    -webkit-border-radius: 1ex;
    box-shadow: none;
    -webkit-box-shadow: none;
  }
`;

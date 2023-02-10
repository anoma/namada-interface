import styled from "styled-components";

export const TransfersContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const ThemedScrollbarList = styled.ul`
  overflow-y: auto;

  /* Custom CSS Scrollbar for ul tags */
  /* NOTE - Firefox will only show max width on hover, otherwise is thin profile */
  scrollbar-width: 10px;
  scrollbar-color: ${(props) =>
    props.theme.colors.primary.main + " " + props.theme.colors.utility1.main80};

  &::-webkit-scrollbar {
    height: 12px;
    width: 10px;
    background: transparent;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.primary.main};
    border-radius: 1ex;
    -webkit-border-radius: 1ex;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-corner {
    background: ${(props) => props.theme.colors.utility1.main80};
  }
`;

export const TransfersContent = styled.div`
  width: 100%;
  padding: 20px 40px;
  margin: 0;
  box-sizing: border-box;
  min-height: 450px;
  color: ${(props) => props.theme.colors.utility2.main60};
`;

export const TransactionList = styled(ThemedScrollbarList)`
  margin: 0;
  padding: 0;
  list-style-type: none;
  width: 100%;
  max-height: 400px;
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
    margin: 0 20px 0 0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 40px;
  margin-bottom: 20px;
`;

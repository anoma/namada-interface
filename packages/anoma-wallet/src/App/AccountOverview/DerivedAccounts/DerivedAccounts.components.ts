import styled from "styled-components/macro";

export const DerivedAccountsContainer = styled.div`
  width: 100%;
  height: 100%;
  font-size: 14px;
`;

export const DerivedAccountsList = styled.ul`
  list-style: none;
  list-style-type: none;
  padding: 0;
  max-height: 500px; /* TODO: Remove this - set a max height on a main container */
  overflow: auto;
`;

export const DerivedAccountContainer = styled.div`
  width: 100%;
`;

export const DerivedAccountItem = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #ddd;
  color: ${(props) => props.theme.colors.titleColor};
  button {
    margin-top: 0;
    margin-right: 0;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const DerivedAccountInfo = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const DerivedAccountAlias = styled.div`
  font-size: 14px;
`;

export const DerivedAccountType = styled.div`
  font-size: 12px;
  color: #777;
`;

export const DerivedAccountBalance = styled.div`
  padding: 8px 0;
  font-weight: bold;
  margin-bottom: 0;
`;

export const DerivedAccountAddress = styled.pre`
  flex: 1 0 60%;
  overflow-x: scroll;
  background: #ddd;
  padding: 8px;
  border: 4px solid #ddd;
  border-radius: 8px;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: 0;
`;

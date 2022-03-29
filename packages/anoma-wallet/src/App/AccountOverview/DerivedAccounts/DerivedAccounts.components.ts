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
`;

export const DerivedAccountItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }
`;

export const DerivedAccountAlias = styled.div`
  flex: 1 0 61%;
`;

export const DerivedAccountType = styled.div`
  flex: 1 0 14%;
  font-size: 12px;
`;

export const DerivedAccountBalance = styled.div`
  flex: 1 0 25%;
  font-weight: bold;

  & > span {
    font-size: 14px;
    font-weight: normal;
  }
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

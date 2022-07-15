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
  max-height: 400px; /* TODO: Remove this - set a max height on a main container */
  overflow-y: auto;

  /* Custom CSS Scrollbar */
  /* NOTE - Firefox will only show max width on hover, otherwise is thin profile */
  /* TODO - Refactor this into a common function */
  scrollbar-width: 10px;
  scrollbar-color: ${(props) =>
    props.theme.colors.buttonBackground2 +
    " " +
    props.theme.colors.background2};

  &::-webkit-scrollbar {
    height: 12px;
    width: 10px;
    background: transparent;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.buttonBackground2};
    border-radius: 1ex;
    -webkit-border-radius: 1ex;
    box-shadow: none;
    -webkit-box-shadow: none;
  }

  &::-webkit-scrollbar-corner {
    background: ${(props) => props.theme.colors.background2};
  }
`;

export const DerivedAccountContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
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
  font-size: 16px;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const DerivedAccountType = styled.div`
  font-size: 12px;
  color: #777;
`;

export const DerivedAccountBalance = styled.div`
  padding: 8px 0;
  font-weight: bold;
  margin-bottom: 0;
  width: 200px;
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

export const DerivedAccountStatus = styled.span`
  font-weight: normal;
  font-size: 12px;
  padding-left: 8px;
  color: ${(props) => props.theme.colors.buttonDisabledBackground};
`;

export const NoTokens = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const Status = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  font-size: 12px;
  font-weight: normal;
  color: ${(props) => props.theme.colors.buttonBorder1};
`;

export const TokenIcon = styled.img`
  width: 36px;
  height: 36px;
  cursor: pointer;
  margin-right: 12px;
`;

export const ShieldedLabel = styled.div`
  color: ${(props) => props.theme.colors.buttonBackground3};
  font-size: 10px;
  display: flex;
  justify-content: center;
  width: 68px;
  padding: 0;
  background-color: ${(props) => props.theme.colors.buttonBackground1};
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.buttonBackground1};
`;

export const TransparentLabel = styled.div`
  color: ${(props) => props.theme.colors.background4};
  font-size: 10px;
  display: flex;
  justify-content: center;
  width: 68px;
  padding: 0;
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
`;

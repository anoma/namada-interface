import styled from "styled-components/macro";

export const AccountOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;

  h1 {
    margin: 0;
  }

  h4 {
    margin: 12px 0;
  }

  h1,
  h4 {
    color: ${(props) => props.theme.colors.titleColor};
  }
`;

export const AccountOverviewContent = styled.div`
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.tabActiveBackground};
`;

export const AccountTabsContainer = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: row;
  padding: 0;
  margin: 0;
`;

export const AccountTab = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.theme.colors.tabInactiveColor};
  background-color: ${(props) => props.theme.colors.tabInactiveBackground};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;

  &.active {
    cursor: default;
    color: ${(props) => props.theme.colors.buttonText1};
    background-color: ${(props) => props.theme.colors.tabActiveBackground};
  }

  &.disabled {
    pointer-events: auto !important;
    cursor: not-allowed !important;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  justify-content: baseline;
  padding: 20px;

  input {
    width: 96%;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  width: 70%;

  & > button {
    flex: 1;
    padding: 8px;
  }
`;

export const TotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeadingContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;

  h4 {
    font-size: 20px;
    margin-bottom: 0;
  }
`;

export const TotalHeading = styled.div`
  text-align: left;

  h1 {
    font-size: 30px;
  }
`;

export const TotalAmount = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 50px;
  font-weight: bold;
  padding: 0;
  text-align: right;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const TotalAmountValue = styled.span`
  margin-bottom: -10px;
`;

export const TotalAmountFiat = styled.span`
  font-size: 20px;
  padding-right: 10px;
`;

export const NoAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 20px 0;
  color: ${(props) => props.theme.colors.titleColor};
`;

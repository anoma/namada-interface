import styled from "styled-components/macro";

export const SettingsAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  max-height: 720px;
`;

export const AccountRows = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  overflow-y: auto;
  width: 100%;
  height: 350px;
  margin: 18px 0 0;
  overflow-y: scroll;
  padding: 2px;

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

export const AccountRow = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border-radius: 8px;
  margin-bottom: 8px;

  &:hover {
    ${(props) =>
      props.disabled ? "" : "background-color: #dedede;cursor: pointer;"}
  }
`;

export const AccountNameContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
  font-family: monospace;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.background3};
`;

export const AccountNameContainerOverflow = styled.div`
  display: block;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const AccountButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  /* width: 64px; */
`;

export const NewAccountButtonContainer = styled.div`
  display: flex;
  justify-content: start;
  align-items: flex-start;

  width: 100%;
  margin: 32px 0 0;
`;

export const AccountAlias = styled.span`
  font-weight: 600;
  padding: 8px;
  width: 120px;
  color: ${(props) => props.theme.colors.titleColor};

  span {
    font-weight: normal;
    display: block;
    font-size: 10px;
  }
`;

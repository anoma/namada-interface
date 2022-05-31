import styled from "styled-components/macro";

export const SettingsAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const AccountRows = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;

  width: 100%;
  margin: 18px 0 0;
  overflow-y: scroll;
  padding: 2px;
`;
export const AccountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  border-radius: 8px;
  margin-bottom: 8px;

  &:hover {
    background-color: #dedede;
    cursor: pointer;
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
`;

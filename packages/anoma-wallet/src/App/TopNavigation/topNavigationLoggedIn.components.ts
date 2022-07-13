import styled from "styled-components/macro";

export const TopNavigationLoggedInContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 760px;
  justify-content: space-between;
  align-items: center;
`;

export const TopNavigationLoggedInControlsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 160px;

  &:first-child {
    padding-right: 20px;
  }
`;

export const SettingsButton = styled.a`
  display: block;
  padding-right: 20px;

  & > div > svg > path {
    stroke: ${(props) => props.theme.colors.buttonBackground4};
    fill: ${(props) => props.theme.colors.buttonBackground4};
  }
`;

export const TopNavigationLoggedInSelectContainer = styled.div`
  width: 145px;

  & select {
    font-size: 10px;
  }
`;

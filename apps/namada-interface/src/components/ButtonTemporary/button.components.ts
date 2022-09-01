import styled from "styled-components/macro";

const transition = "all 0.3s ease-in-out";

export const ButtonContainer = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  background-color: ${(props) => props.theme.colors.primary.main80};
  cursor: pointer;
  border: 2px solid ${(props) => props.theme.colors.primary.main80};
  border-bottom: solid 4px ${(props) => props.theme.colors.primary.main60};
  height: 50px;
  min-height: 50px;
  min-width: 48px;
  border-radius: 999px;
  font-weight: 600;
  transition: ${transition};
  &:hover {
    background-color: ${(props) => props.theme.colors.primary.main60};
    border: 2px solid ${(props) => props.theme.colors.primary.main60};
    border-bottom: solid 4px ${(props) => props.theme.colors.primary.main60};
  }
  &:disabled {
    background-color: ${(props) => props.theme.colors.primary.main60};
    border: 2px solid ${(props) => props.theme.colors.primary.main60};
    border-bottom: solid 4px ${(props) => props.theme.colors.primary.main60};
    cursor: default;
  }
`;

export const ButtonContainerOutline = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;

  // if light we use different
  color: ${(props) =>
    props.theme.themeConfigurations.isLightMode
      ? props.theme.colors.primary.main80
      : "white"};
  background-color: ${(props) => props.theme.colors.utility1.main80};
  cursor: pointer;

  // if light we use different color in the borders
  // TODO: Add these colors to theme
  border: 2px solid
    ${(props) =>
      props.theme.themeConfigurations.isLightMode
        ? props.theme.colors.primary.main
        : "white"};
  border-bottom: solid 4px
    ${(props) =>
      props.theme.themeConfigurations.isLightMode
        ? props.theme.colors.primary.main
        : "white"};
  height: 50px;
  min-height: 50px;
  min-width: 48px;
  border-radius: 999px;
  font-weight: 600;
  transition: ${transition};
  &:hover {
    background-color: ${(props) => props.theme.colors.primary.main60};

    border: 2px solid ${(props) => props.theme.colors.primary.main40};
    border-bottom: solid 4px ${(props) => props.theme.colors.primary.main40};
  }
  &:disabled {
    background-color: ${(props) => props.theme.colors.primary.main80};
    cursor: default;
  }
`;

export const ButtonContainerText = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 16px;
  background: none;
  cursor: pointer;
  border: none;
  color: ${(props) => props.theme.colors.utility2.main80};
  height: 32px;
  min-height: 32px;
  min-width: 48px;
  border-radius: 4px;
  font-weight: 600;
  transition: ${transition};
  &:hover {
    background-color: ${(props) => props.theme.colors.utility1.main75};
  }
  &:disabled {
    background-color: ${(props) => props.theme.colors.primary.main60};
    cursor: default;
  }
`;

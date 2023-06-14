import styled, { createGlobalStyle, css } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html, body {
    background-color: #000;
  }
`;

export const Spinner = css`
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-top-color: ${(props) => props.theme.colors.primary.main};
    border-radius: 50%;
    animation: button-loading-spinner 1s ease infinite;

    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }

      to {
        transform: rotate(1turn);
      }
    }
  }
`;

export const AppContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: top;
  flex-direction: column;
  font-family: "Space Grotesk", sans-serif;
  height: 100%;
  min-height: 430px;
  width: 400px;
  box-sizing: border-box;

  @media screen and (max-width: 860px) {
    margin: 0;
    padding: 0 8px;
    min-width: 360px;
    min-height: 360px;
  }
`;

export const TopSection = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px;
`;

export const Heading = styled.h1`
  display: flex;
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.utility1.main20};
  padding-left: 12px;
`;

export const HeadingLoader = styled.div`
  position: relative;
  width: 20px;
  height: 20px;

  &.is-loading::after {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    ${Spinner}
  }
`;

export const HeadingButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100px;
  padding-right: 12px;
`;

export const SettingsButton = styled.a`
  padding: 5px;
  transition: "1 sec";
  border-radius: 4px;
  width: 34px;

  & > div > svg > path {
    fill: ${(props) => props.theme.colors.utility1.main40};
    stroke: ${(props) => props.theme.colors.utility1.main40};
  }

  &:active {
    border: 1px solid ${(props) => props.theme.colors.primary.main};
    background-color: ${(props) => props.theme.colors.primary.main};
  }
`;

export const BottomSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
`;

export const ContentContainer = styled.div`
  display: flex;
  height: 100%;
  min-height: 360px;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  background-color: ${(props) => props.theme.colors.utility1.main80};
  color: ${(props) => props.theme.colors.utility1.main20};
`;

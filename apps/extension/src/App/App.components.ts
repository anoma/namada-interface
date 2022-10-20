import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html, body {
    background-color: #000;
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
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 12px;
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

export const Heading = styled.h1`
  font-size: 18px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.utility1.main20};
`;

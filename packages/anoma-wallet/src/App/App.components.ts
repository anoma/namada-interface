import styled, { createGlobalStyle } from "styled-components/macro";
import { motion } from "framer-motion";

type GlobalStyleProps = {
  isLightMode: boolean;
};

// Set global styles for themed control of background color based
// on whether the user is logged in
export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
  html, body {
    background-color: ${(props) => (props.isLightMode ? "#ffffff" : "#000000")};
    transition: background-color 0.5s ease;
  }
`;

export const MotionContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
`;

export const AppContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${(props) => props.theme.colors.background1};
  transition: all 0.3s linear;
  box-sizing: border-box;

  @media screen and (max-width: 860px) {
    padding: 0 36px;
    min-width: 480px;
  }
`;

export const TopSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 120px;
  width: 100%;
`;

export const BottomSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: calc(100% - 120px);
  width: 100%;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  // TODO: maybe this is too hacky? maybe there could be just another div
  // behind the main one with transform: translate(-4px, 4px);
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.background2};
  padding: 0;
  min-height: 620px;
  width: 100%;
  max-width: 760px;
  border-radius: 24px;
  overflow-x: hidden;
  ${(props) => `border: solid 1px ${props.theme.colors.border}`};
  transition: background-color 0.3s linear;
`;

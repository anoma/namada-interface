import styled from "styled-components/macro";
import { motion } from "framer-motion";

export const MainSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  // TODO: maybe this is too hacky? maybe there could be just another div
  // behind the main one with transform: translate(-4px, 4px);
  box-sizing: border-box;
  background-color: ${(props) => props.theme.colors.background2};
  padding: ${(props) =>
    props.theme.themeConfigurations.isLightMode ? "0 32px" : "4px 36px 0 32px"};
  height: 620px;
  width: 480px;
  border-radius: 24px;
  overflow-x: hidden;
  ${(props) =>
    props.theme.themeConfigurations.isLightMode
      ? `border: solid 4px ${props.theme.colors.border}`
      : ""};
  border-left: solid 8px ${(props) => props.theme.colors.border};
  border-bottom: solid 8px ${(props) => props.theme.colors.border};
  transition: background-color 0.3s linear;
`;

export const MotionContainer = styled(motion.div)`
  height: 100%;
  box-sizing: border-box;
  padding: 0 0 64px 0;
`;
export const TopSection = styled.section`
  display: flex;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 32px 0;
`;

export const TopSectionHeaderContainer = styled.section`
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
`;

export const TopSectionButtonContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  min-height: 50px;
`;

export const RouteContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: scroll;
  width: 100%;
  height: 100%;
`;

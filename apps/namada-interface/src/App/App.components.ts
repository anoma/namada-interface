import styled, { createGlobalStyle } from "styled-components";
import { motion } from "framer-motion";

import { ColorMode, DesignConfiguration } from "@namada/utils";

enum ComponentColor {
  BorderColor,
  BackgroundColor,
}

const topSectionHeight = "164px";

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.BorderColor]: theme.colors.utility2.main20,
      [ComponentColor.BackgroundColor]: theme.colors.utility1.main,
    },
    dark: {
      [ComponentColor.BorderColor]: "transparent",
      [ComponentColor.BackgroundColor]: theme.colors.utility1.main80,
    },
  };

  return colorMap[colorMode][color];
};

type GlobalStyleProps = {
  colorMode: ColorMode;
};

// Set global styles for themed control of background color based
// on whether the user is logged in
export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
  html, body {
    background-color: ${(props) => props.theme.colors.utility1.main};
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
  background-color: ${(props) => props.theme.colors.utility1.main};
  transition: all 0.3s linear;
  box-sizing: border-box;

  @media screen and (max-width: 860px) {
    padding: 0 36px;
    min-width: 480px;
  }
`;

export const AppLoader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;

  &::after {
    content: "";
    position: absolute;
    width: 32px;
    height: 32px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 4px solid transparent;
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

export const TopSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: ${topSectionHeight};
  width: 100%;
`;

export const BottomSection = styled.section`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: calc(100% - ${topSectionHeight});
  width: 100%;
`;

export const ContentContainer = styled.div`
  flex-direction: column;
  justify-content: start;
  align-items: center;
  // TODO: maybe this is too hacky? maybe there could be just another div
  // behind the main one with transform: translate(-4px, 4px);
  box-sizing: border-box;
  background-color: ${(props) =>
    getColor(ComponentColor.BackgroundColor, props.theme)};
  border: 1px solid
    ${(props) => getColor(ComponentColor.BorderColor, props.theme)};

  padding: 0;
  min-height: 620px;
  width: 100%;
  max-width: 760px;
  border-radius: ${(props) => props.theme.borderRadius.mainContainer};
  overflow-x: hidden;
  transition: background-color 0.3s linear;
`;

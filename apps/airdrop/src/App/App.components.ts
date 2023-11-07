import styled, { createGlobalStyle } from "styled-components";
import { ColorMode, DesignConfiguration } from "@namada/utils";

type GlobalStyleProps = {
  colorMode: ColorMode;
};

const topSectionHeight = "164px";

enum ComponentColor {
  BorderColor,
  BackgroundColor,
}

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

// Set global styles for themed control of background color based
// on whether the user is logged in
export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
  html, body {
    background-color: ${(props) => props.theme.colors.utility1.main};
    transition: background-color 0.5s ease;
  }
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
  box-sizing: border-box;
  padding: 20px;
  background-color: ${(props) =>
    getColor(ComponentColor.BackgroundColor, props.theme)};
  border: 1px solid
    ${(props) => getColor(ComponentColor.BorderColor, props.theme)};

  min-height: 620px;
  width: 100%;
  max-width: 762px;
  border-radius: ${(props) => props.theme.borderRadius.mainContainer};
  overflow-x: hidden;
  transition: background-color 0.3s linear;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Header = styled.h2`
  color: ${(props) => props.theme.colors.primary.main};
`;

export const HeaderTwo = styled.h3`
  color: ${(props) => props.theme.colors.primary.main};
`;

export const ClaimsSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Claims = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
`;

export const Claim = styled.div`
  display: flex;
  flex-direction: column;
`;

export const EligibilityInfo = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  margin-bottom: 10px;
`;

export const ClaimLabel = styled.span`
  color: ${(props) => props.theme.colors.utility2.main};
  font-weight: bold;
`;
export const ClaimValue = styled.span`
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const NamadaSection = styled.div``;

export const Address = styled.div`
  color: white;
  font-size: 12px;
  margin-top: 10px;
`;

export const TextButton = styled.div`
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary.main};
`;

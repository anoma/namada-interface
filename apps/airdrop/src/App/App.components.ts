import styled, { createGlobalStyle } from "styled-components";
import { ColorMode, DesignConfiguration, spacement } from "@namada/utils";

type GlobalStyleProps = {
  colorMode: ColorMode;
};

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
    background-color: ${(props) => props.theme.colors.primary.main};
    transition: background-color 0.5s ease;
  }
`;
export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 800px;
  margin: 0 auto;
  transition: all 0.3s linear;
  box-sizing: border-box;
`;

export const AppContainerHeader = styled.div`
  display: flex;
  align-self: flex-start;
  justify-content: space-between;
  width: 100%;
  margin-top: 20px;

  & > button {
    margin: 10px 0 0 0;
  }
  & a {
    color: ${(props) => props.theme.colors.utility2.main};
    text-decoration: none;
  }
`;

export const Logo = styled.div``;

// Common.components
export const Breadcrumb = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.utility2.main};

  &.active {
    color: ${(props) => props.theme.colors.primary.main};
  }
`;

// Main.components
export const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const MainHeader = styled.div`
  span {
    color: ${(props) => props.theme.colors.primary.main};
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
      1px 1px 0 #000;
  }
`;

export const MainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
  margin-top: 40px;
  width: 770px;
  height: 770px;
  border-radius: 50%;
  border: ${spacement(8)} solid ${(props) => props.theme.colors.utility3.black};
  text-align: center;
`;

export const MainSectionTime = styled.div`
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const MainSectionButton = styled.div`
  align-self: center;
`;

export const Divider = styled.div`
  width: 190px;
  align-self: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.utility2.main};
`;

export const MainFooter = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: ${spacement(10)};
  color: ${(props) => props.theme.colors.utility2.main};
  text-align: center;
`;

export const MainModal = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  & > button {
    margin: 10px 0;
  }
`;

export const KeplrButtonContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  color: ${(props) => props.theme.colors.utility2.main};
  text-align: center;

  & > button {
    margin: 10px 0;
  }
`;

export const TOSToggle = styled.div`
  display: flex;
  color: ${(props) => props.theme.colors.utility2.main};
  gap: 10px;
  align-items: center;
  margin-top: 20px;
  & > button {
    min-width: 45px;
  }

  & > span {
    cursor: pointer;
  }
`;

//Eligibility.components
export const EligibilityContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

export const GithubHeader = styled.div`
  & > button {
    margin: 0;
  }
`;

export const GithubBreadcrumb = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 40px;
`;

export const EligibilitySectionWrapper = styled.div`
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
  padding: 20px;
`;

export const EligibilitySection = styled.div`
  display: flex;
  gap: 20px;
  color: ${(props) => props.theme.colors.utility2.main};
  justify-content: space-between;
  & h1 {
    text-align: left;
  }

  & > button {
    align-self: center;
  }
`;

export const ClaimsSection = styled.div`
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme.colors.utility2.main};
  & > button {
    margin-top: 10px;
    width: 200px;
    align-self: center;
  }
`;

export const AnotherWays = styled.div`
  margin-top: 30px;

  & > h2 {
    text-align: left;
  }
`;

export const AnotherWaysButtons = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  & > button {
    margin: 0;
  }
`;

export const ClaimsSectionSignature = styled.div``;

export const GithubFooter = styled.div``;

export const AirdropAddress = styled.div`
  display: flex;
  flex-direction: row;

  & > label {
    flex: 1;
  }

  & > button {
    width: 80px;
    align-self: flex-end;
    padding: 10px;
  }
`;

export const ExtensionInfo = styled.div`
  margin-top: 20px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
`;

// AirdropConfirmation.components
export const AirdropConfirmationContainer = styled.div``;

export const AirdropConfirmationHeader = styled.div`
  margin-top: 20px;
  & > button {
    margin: 0;
  }
`;

export const AirdropConfirmationSection = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.utility2.main};
`;

// TSEligibility.components
//
export const TSEligibilityContainer = styled.div`
  width: 100%;
  color: ${(props) => props.theme.colors.utility2.main};
  & > button {
    margin: 10px 0 0 0;
  }
`;

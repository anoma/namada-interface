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
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 800px;
  margin: 0 auto;
  background-color: ${(props) => props.theme.colors.utility1.main};
  transition: all 0.3s linear;
  box-sizing: border-box;
`;

export const AppContainerHeader = styled.div`
  align-self: flex-start;

  & > button {
    margin: 10px 0 0 0;
  }
`;

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
`;
export const MainHeader = styled.div`
  text-align: center;
`;

export const MainSection = styled.div`
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
  display: grid;
  grid-template-columns: auto auto;
  gap: 20px;
  padding: 20px;
  margin-top: 40px;
`;

export const MainSectionTime = styled.div`
  color: ${(props) => props.theme.colors.utility2.main};
  text-align: center;
`;

export const MainFooter = styled.div`
  margin-top: 40px;
  color: ${(props) => props.theme.colors.utility2.main};
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

// TODO: rename to sth more generic like InputWIthButton idk
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

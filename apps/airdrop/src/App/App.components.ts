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

// export const ClaimsSection = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

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

export const AddressText = styled.div`
  color: white;
  font-size: 12px;
  margin-top: 10px;
`;

export const TextButton = styled.div`
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary.main};
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
  width: 800px;
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

//Github.components
export const GithubContainer = styled.div`
  width: 800px;
`;

export const GithubHeader = styled.div`
  margin-top: 20px;
  & > button {
    margin: 0;
  }
`;

export const GithubBreadcrumb = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 40px;
`;

export const GithubSection = styled.div`
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
  padding: 20px;
`;

export const EligibilitySection = styled.div`
  display: flex;
  gap: 20px;
  color: ${(props) => props.theme.colors.utility2.main};
  justify-content: space-between;

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
    margin: 0 0 2px 10px;
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
export const AirdropConfirmationContainer = styled.div`
  width: 800px;
`;

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

import React from "react";
import { TopNavigation } from "./TopNavigation";
import { MainSection } from "./MainSection";
import {
  AppContainer,
  MainSectionContainer,
  TopSection,
} from "./styledComponents";
import { ThemeProvider } from "styled-components";
import { darkColors, lightColors, Theme } from "../utils/theme";

const getTheme = (isLightMode: boolean) => {
  console.log(isLightMode, "isLightMode");
  const colors = isLightMode ? lightColors : darkColors;
  const theme: Theme = {
    themeConfigurations: {
      isLightMode: isLightMode,
    },
    colors: colors,
  };
  return theme;
};

function App(): JSX.Element {
  const [isLightMode, setIsLightMode] = React.useState(true);
  const theme = getTheme(isLightMode);
  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <TopSection>
          <TopNavigation
            isLightMode={isLightMode}
            setIsLightMode={setIsLightMode}
          />
        </TopSection>
        <MainSectionContainer>
          <MainSection />
        </MainSectionContainer>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;

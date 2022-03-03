import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopNavigation } from "./TopNavigation";
import { MainSection } from "./MainSection";
import { KeyManagement } from "./KeysManagement";
import {
  AppContainer,
  MainSectionContainer,
  TopSection,
} from "./styledComponents";
import { ThemeProvider } from "styled-components/macro";
import { darkColors, lightColors, Theme } from "utils/theme";

// this sets the dark/light colors to theme
const getTheme = (isLightMode: boolean): Theme => {
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
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AppContainer>
          <TopSection>
            <TopNavigation
              isLightMode={isLightMode}
              setIsLightMode={setIsLightMode}
            />
          </TopSection>
          <MainSectionContainer>
            <Routes>
              <Route path="/" element={<MainSection />} />
              <Route path="/key-management" element={<KeyManagement />} />
            </Routes>
          </MainSectionContainer>
        </AppContainer>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

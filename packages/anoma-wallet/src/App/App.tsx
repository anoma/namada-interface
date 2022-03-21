/* eslint-disable max-len */
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { TopNavigation } from "./TopNavigation";
import { MainSection } from "./MainSection";
import { AccountCreation } from "./AccountCreation";
import {
  AppContainer,
  MainSectionContainer,
  TopSection,
} from "./styledComponents";
import { ThemeProvider } from "styled-components/macro";
import { darkColors, lightColors, Theme } from "utils/theme";
import { store } from "store";

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
    <Provider store={store}>
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
                <Route
                  path="/account-creation/*"
                  element={<AccountCreation />}
                />
              </Routes>
            </MainSectionContainer>
          </AppContainer>
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

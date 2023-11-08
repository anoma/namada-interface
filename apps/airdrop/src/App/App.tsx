import React, { useReducer, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import { Heading, HeadingLevel } from "@namada/components";

import {
  AppContainer,
  BottomSection,
  Claims,
  ClaimsSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "App/App.components";
import { Route, Routes } from "react-router-dom";
import { NamadaAddress } from "./NamadaAddress";
import { GithubClaim } from "./GithubClaim";
import { KeplrClaim } from "./KeplrClaim";
import { DEFAULT_STATE, reducer } from "./state";

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [{ namadaAddress }, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const theme = getTheme(colorMode);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <TopSection>
          <Heading level={HeadingLevel.One}>Namada Airdrop</Heading>
        </TopSection>
        <Routes>
          <Route
            path={`/`}
            element={
              <ContentContainer>
                <NamadaAddress
                  dispatch={dispatch}
                  address={namadaAddress}
                ></NamadaAddress>
                <ClaimsSection>
                  {namadaAddress && (
                    <>
                      <Heading level={HeadingLevel.Two}>
                        Check your claims:
                      </Heading>
                      <Claims>
                        <GithubClaim namadaAddress={namadaAddress} />
                        <KeplrClaim namadaAddress={namadaAddress} />
                      </Claims>
                    </>
                  )}
                </ClaimsSection>
              </ContentContainer>
            }
          />
        </Routes>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};

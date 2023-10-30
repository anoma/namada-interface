import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import { Heading } from "@namada/components";

import {
  AppContainer,
  Banner,
  BannerContents,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "App/App.components";
import { FaucetForm } from "App/Faucet";

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [isTestnetLive, setIsTestnetLive] = useState(true);
  const theme = getTheme(colorMode);

  useEffect(() => {
    // Logic to determine if testnet has gone live
    const launchDate = {
      year: 2023,
      monthIndex: 9,
      dayOfMonth: 5,
      hour: 17,
      minutes: 0,
    };

    const liveDate = new Date(
      Date.UTC(
        launchDate.year,
        launchDate.monthIndex,
        launchDate.dayOfMonth,
        launchDate.hour,
        launchDate.minutes
      )
    ).getTime();

    const now = new Date();
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes()
    );

    if (nowUTC < liveDate) {
      setIsTestnetLive(false);
    } else {
      setIsTestnetLive(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      {!isTestnetLive && (
        <Banner>
          <BannerContents>
            Testnet will go live 5 October 2023 17:00 UTC! Faucet is disabled
            until then.
          </BannerContents>
        </Banner>
      )}
      <AppContainer>
        <TopSection>
          <Heading level="h1">Namada Faucet</Heading>
        </TopSection>
        <ContentContainer>
          <FaucetForm isTestnetLive={isTestnetLive} />
        </ContentContainer>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};

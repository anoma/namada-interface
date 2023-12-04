import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import { Heading } from "@namada/components";

import {
  AppContainer,
  BackgroundImage,
  Banner,
  BannerContents,
  BottomSection,
  ContentContainer,
  FaucetContainer,
  GlobalStyles,
  TopSection,
} from "App/App.components";
import { FaucetForm } from "App/Faucet";

import dotsBackground from "../../public/bg-dots.svg";
import { CardsContainer } from "./Card.components";
import { CallToActionCard } from "./CallToActionCard";
import { Faq } from "./Faq";

const runFullNodeUrl = "https://docs.namada.net/operators/ledger";
const becomeBuilderUrl = "https://docs.namada.net/integrating-with-namada";

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
      <BackgroundImage imageUrl={dotsBackground} />
      <AppContainer>
        <ContentContainer>
          <TopSection>
            <Heading uppercase themeColor="utility1" size="5xl" level="h1">
              Namada Faucet
            </Heading>
          </TopSection>
          <FaucetContainer>
            <FaucetForm isTestnetLive={isTestnetLive} />
          </FaucetContainer>
          <BottomSection>
            <CardsContainer>
              <CallToActionCard
                description="Contribute to the Namada network's resiliency"
                title="RUN A FULL NODE"
                href={runFullNodeUrl}
              />
              <CallToActionCard
                description="Integrate Namada into applications or extend its capabilities"
                title="BECOME A BUILDER"
                href={becomeBuilderUrl}
              />
            </CardsContainer>
            <Faq />
          </BottomSection>
        </ContentContainer>
      </AppContainer>
    </ThemeProvider>
  );
};

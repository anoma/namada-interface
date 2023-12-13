import React, { createContext, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { Heading } from "@namada/components";
import { ColorMode, getTheme } from "@namada/utils";

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

import { requestSettings } from "utils";
import dotsBackground from "../../public/bg-dots.svg";
import { CallToActionCard } from "./CallToActionCard";
import { CardsContainer } from "./Card.components";
import { Faq } from "./Faq";

const DEFAULT_URL = "http://localhost:5000";
const DEFAULT_ENDPOINT = "/api/v1/faucet";
const DEFAULT_FAUCET_LIMIT = "1000";

const {
  NAMADA_INTERFACE_FAUCET_API_URL: faucetApiUrl = DEFAULT_URL,
  NAMADA_INTERFACE_FAUCET_API_ENDPOINT: faucetApiEndpoint = DEFAULT_ENDPOINT,
  NAMADA_INTERFACE_FAUCET_LIMIT: faucetLimit = DEFAULT_FAUCET_LIMIT,
  NAMADA_INTERFACE_PROXY: isProxied,
  NAMADA_INTERFACE_PROXY_PORT: proxyPort = 9000,
} = process.env;

const apiUrl = isProxied ? `http://localhost:${proxyPort}/proxy` : faucetApiUrl;
const url = `${apiUrl}${faucetApiEndpoint}`;
const limit = parseInt(faucetLimit);
const runFullNodeUrl = "https://docs.namada.net/operators/ledger";
const becomeBuilderUrl = "https://docs.namada.net/integrating-with-namada";

type Settings = {
  difficulty?: number;
  tokens?: Record<string, string>;
  startsAt?: number;
};

type AppSettings = Settings & {
  limit: number;
  url: string;
};

export const SettingsContext = createContext<AppSettings>({ limit, url });

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [isTestnetLive, setIsTestnetLive] = useState(true);
  const [settings, setSettings] = useState<Settings>();
  const theme = getTheme(colorMode);

  useEffect(() => {
    // Fetch settings
    (async () => {
      const {
        difficulty,
        start_at: startsAt,
        tokens_alias_to_address: tokens,
      } = await requestSettings(url).catch((e) => {
        throw new Error(`Error requesting settings: ${e}`);
      });
      console.log("Settings", { difficulty, startsAt, tokens });
      setSettings({
        difficulty,
        startsAt,
        tokens,
      });
    })();
    // Logic to determine if testnet has gone live
    // const launchDate = {
    //   year: 2023,
    //   monthIndex: 9,
    //   dayOfMonth: 5,
    //   hour: 17,
    //   minutes: 0,
    // };
    //
    // const liveDate = new Date(
    //   Date.UTC(
    //     launchDate.year,
    //     launchDate.monthIndex,
    //     launchDate.dayOfMonth,
    //     launchDate.hour,
    //     launchDate.minutes
    //   )
    // ).getTime();
    //
    // const now = new Date();
    // const nowUTC = Date.UTC(
    //   now.getUTCFullYear(),
    //   now.getUTCMonth(),
    //   now.getUTCDate(),
    //   now.getUTCHours(),
    //   now.getUTCMinutes()
    // );
    //
    // if (nowUTC < liveDate) {
    //   setIsTestnetLive(false);
    // } else {
    //   setIsTestnetLive(true);
    // }
  }, []);

  useEffect(() => {
    if (settings) {
      const { startsAt } = settings;
      console.log("Start at", { startsAt, isTestnetLive });
      // TODO
      setIsTestnetLive(false);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        limit,
        url,
        ...settings,
      }}
    >
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
    </SettingsContext.Provider>
  );
};

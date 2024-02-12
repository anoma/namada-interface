import React, { createContext, useCallback, useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ActionButton, Alert, Heading } from "@namada/components";
import { Namada } from "@namada/integrations";
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
  InfoContainer,
  TopSection,
} from "App/App.components";
import { FaucetForm } from "App/Faucet";

import { chains } from "@namada/chains";
import { useUntil } from "@namada/hooks";
import { Account, AccountType } from "@namada/types";
import { API } from "utils";
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
const api = new API(url);
const limit = parseInt(faucetLimit);
const runFullNodeUrl = "https://docs.namada.net/operators/ledger";
const becomeBuilderUrl = "https://docs.namada.net/integrating-with-namada";

type Settings = {
  difficulty?: number;
  tokens?: Record<string, string>;
  startsAt: number;
  startsAtText?: string;
};

type AppContext = Settings & {
  limit: number;
  url: string;
  settingsError?: string;
  api: API;
};

const START_TIME_UTC = 1702918800;
const START_TIME_TEXT = new Date(START_TIME_UTC * 1000).toLocaleString(
  "en-gb",
  {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }
);

const defaults = {
  startsAt: START_TIME_UTC,
  startsAtText: `${START_TIME_TEXT} UTC`,
};

export const AppContext = createContext<AppContext>({
  ...defaults,
  limit,
  url,
  api,
});

enum ExtensionAttachStatus {
  PendingDetection,
  NotInstalled,
  Installed,
}

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const chain = chains.namada;
  const integration = new Namada(chain);
  const [extensionAttachStatus, setExtensionAttachStatus] = useState(
    ExtensionAttachStatus.PendingDetection
  );
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [isTestnetLive, setIsTestnetLive] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    ...defaults,
  });
  const [settingsError, setSettingsError] = useState<string>();
  const theme = getTheme(colorMode);

  useUntil(
    {
      predFn: async () => Promise.resolve(integration.detect()),
      onSuccess: () => {
        setExtensionAttachStatus(ExtensionAttachStatus.Installed);
      },
      onFail: () => {
        setExtensionAttachStatus(ExtensionAttachStatus.NotInstalled);
      },
    },
    { tries: 5, ms: 300 },
    [integration]
  );

  useEffect(() => {
    const { startsAt } = settings;
    const now = new Date();
    const nowUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes()
    );
    const startsAtToMilliseconds = startsAt * 1000;
    if (nowUTC < startsAtToMilliseconds) {
      setIsTestnetLive(false);
    }

    // Fetch settings from faucet API
    (async () => {
      try {
        const { difficulty, tokens_alias_to_address: tokens } = await api
          .settings()
          .catch((e) => {
            const message = e.errors?.message;
            setSettingsError(
              `Error requesting settings: ${message?.join(" ")}`
            );
            throw new Error(e);
          });
        // Append difficulty level and tokens to settings
        setSettings({
          ...settings,
          difficulty,
          tokens,
        });
      } catch (e) {
        setSettingsError(`Failed to load settings! ${e}`);
      }
    })();
  }, []);

  const handleConnectExtensionClick = useCallback(async (): Promise<void> => {
    if (integration) {
      try {
        const isIntegrationDetected = integration.detect();

        if (!isIntegrationDetected) {
          throw new Error("Extension not installed!");
        }

        await integration.connect();
        const accounts = await integration.accounts();
        if (accounts) {
          setAccounts(
            accounts.filter(
              (account) =>
                !account.isShielded && account.type !== AccountType.Ledger
            )
          );
        }
        setIsExtensionConnected(true);
      } catch (e) {
        console.error(e);
      }
    }
  }, [integration]);

  return (
    <AppContext.Provider
      value={{
        settingsError,
        limit,
        url,
        api,
        ...settings,
      }}
    >
      <ThemeProvider theme={theme}>
        <GlobalStyles colorMode={colorMode} />
        {!isTestnetLive && settings?.startsAtText && (
          <Banner>
            <BannerContents>
              Testnet will go live {settings.startsAtText}! Faucet is disabled
              until then.
            </BannerContents>
          </Banner>
        )}
        <BackgroundImage imageUrl={dotsBackground} />
        <AppContainer>
          <ContentContainer>
            <TopSection>
              <Heading className="uppercase text-black text-4xl" level="h1">
                Namada Shielded Expedition Faucet
              </Heading>
            </TopSection>
            <FaucetContainer>
              {extensionAttachStatus ===
                ExtensionAttachStatus.PendingDetection && (
                <InfoContainer>
                  <Alert type="info">Detecting extension...</Alert>
                </InfoContainer>
              )}
              {extensionAttachStatus === ExtensionAttachStatus.NotInstalled && (
                <InfoContainer>
                  <Alert type="error">You must download the extension!</Alert>
                </InfoContainer>
              )}
              {isExtensionConnected && (
                <FaucetForm
                  accounts={accounts}
                  integration={integration}
                  isTestnetLive={isTestnetLive}
                />
              )}
              {extensionAttachStatus === ExtensionAttachStatus.Installed &&
                !isExtensionConnected && (
                  <InfoContainer>
                    <ActionButton onClick={handleConnectExtensionClick}>
                      Connect to Namada Extension
                    </ActionButton>
                  </InfoContainer>
                )}
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
    </AppContext.Provider>
  );
};

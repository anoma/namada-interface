import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";

import {
  Addresses,
  AppContainer,
  BottomSection,
  ContentContainer,
  GlobalStyles,
  TopSection,
} from "App/App.components";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useIntegrationConnection } from "@namada/hooks";
import { Account } from "@namada/types";

const {
  REACT_APP_CLIENT_ID: clientId = "",
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId",
  REACT_APP_COSMOS_CHAIN_ID: cosmosChainId = "cosmosChainId",
} = process.env;

const getAccessToken = async (code: string): Promise<string> => {
  // Request to exchange code for an access token
  const response = await fetch(
    `http://localhost:5000/api/v1/access_token/${code}`,
    {
      method: "GET",
    }
  );
  const text = await response.text();
  const params = new URLSearchParams(text);
  const access_token = params.get("access_token");

  if (!access_token) {
    throw new Error("No access token");
  }

  return access_token;
};

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const navigate = useNavigate();
  const theme = getTheme(colorMode);

  const url = window.location.href;
  const hasCode = url.includes("?code=");
  const namadaAttachStatus = "attached";
  const keplrAttachStatus = "attached";

  const [namada, isConnectingToNamada, withNamadaConnection] =
    useIntegrationConnection(namadaChainId);

  const handleNamadaConnection = async (): Promise<void> => {
    withNamadaConnection(
      async () => {
        const accounts = await namada?.accounts();
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }

        setIsExtensionConnected(true);
      },
      async () => {
        setIsExtensionConnected(false);
      }
    );
  };

  const [keplr, isConnectingToKeplr, withKeplrConnection] =
    useIntegrationConnection(cosmosChainId);

  const handleKeplrConnection = async (): Promise<void> => {
    withKeplrConnection(
      async () => {
        const accounts = await keplr?.accounts();
        if (accounts && accounts.length > 0) {
          const address = accounts[0].address;
          const signature = await keplr?.signArbitrary(
            "cosmoshub-4",
            address,
            "Namada"
          );
          console.log(signature);
        }

        setIsExtensionConnected(true);
      },
      async () => {
        setIsExtensionConnected(false);
      }
    );
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    //TODO: check if access_token is valid, backend call?
    if (hasCode) {
      const code = url.split("?code=")[1];
      getAccessToken(code).then((access_token) => {
        setIsGithubConnected(true);
        navigate("/", { replace: true });
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <TopSection>
          <Heading level={HeadingLevel.One}>Namada Airdrop</Heading>
        </TopSection>
        <Routes>
          <Route path={`/login`} element={<a>login</a>} />
          <Route
            path={`/`}
            element={
              <ContentContainer>
                {!isGithubConnected && (
                  <a
                    className="login-link"
                    href={`https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUrl}`}
                  >
                    <Button variant={ButtonVariant.Contained}>
                      Login with GitHub
                    </Button>
                  </a>
                )}

                <Button
                  variant={ButtonVariant.Contained}
                  onClick={
                    namadaAttachStatus === "attached"
                      ? handleNamadaConnection
                      : handleDownloadExtension.bind(null, "https://namada.me")
                  }
                >
                  {["attached", "pending"].includes(namadaAttachStatus)
                    ? "Get addresses"
                    : "Click to download the Namada extension"}
                </Button>

                <Button
                  variant={ButtonVariant.Contained}
                  onClick={
                    keplrAttachStatus === "attached"
                      ? handleKeplrConnection
                      : handleDownloadExtension.bind(
                          null,
                          "https://www.keplr.app/"
                        )
                  }
                >
                  {["attached", "pending"].includes(keplrAttachStatus)
                    ? "Connect to Keplr"
                    : "Click to download the Keplr extension"}
                </Button>
                <Addresses>Address: {account?.address}</Addresses>
              </ContentContainer>
            }
          />
        </Routes>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};

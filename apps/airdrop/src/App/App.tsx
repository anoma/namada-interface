import React, { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import { ColorMode, getTheme } from "@namada/utils";
import { Heading, HeadingLevel } from "@namada/components";

import {
  AppContainer,
  BottomSection,
  GlobalStyles,
  TopSection,
} from "App/App.components";

const {
  REACT_APP_CLIENT_ID: clientId = "",
  REACT_APP_CLIENT_SECRET: clientSecret = "",
  REACT_APP_REDIRECT_URI: redirectUrl = "",
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
  const theme = getTheme(colorMode);

  const url = window.location.href;
  const hasCode = url.includes("?code=");

  useEffect(() => {
    if (hasCode) {
      const code = url.split("?code=")[1];
      getAccessToken(code);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles colorMode={colorMode} />
      <AppContainer>
        <TopSection>
          <Heading level={HeadingLevel.One}>Namada Airdrop</Heading>
        </TopSection>
        <a
          className="login-link"
          href={`https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUrl}`}
          onClick={() => {}}
        >
          <span>Login with GitHub</span>
        </a>
        <BottomSection />
      </AppContainer>
    </ThemeProvider>
  );
};

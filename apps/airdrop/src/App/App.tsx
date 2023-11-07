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
  Address,
  AppContainer,
  BottomSection,
  Claim,
  ClaimLabel,
  ClaimValue,
  Claims,
  ClaimsSection,
  ContentContainer,
  EligibilityInfo,
  GlobalStyles,
  Header,
  HeaderTwo,
  NamadaSection,
  TextButton,
  TopSection,
} from "App/App.components";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useIntegrationConnection } from "@namada/hooks";
import { Account } from "@namada/types";

type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  claimed: boolean;
};

type GithubClaimResponse = {
  confirmed: boolean;
};

const {
  REACT_APP_CLIENT_ID: clientId = "",
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId",
  REACT_APP_COSMOS_CHAIN_ID: cosmosChainId = "cosmosChainId",
} = process.env;

const getAccessToken = async (code: string): Promise<GithubClaim> => {
  const response = await fetch(
    `http://localhost:5000/api/v1/airdrop/github/${code}`,
    {
      method: "GET",
    }
  );
  const json = await response.json();

  return { ...json, claimed: false };
};

const claimWithGithub = async (
  access_token: string,
  airdrop_address: string
): Promise<GithubClaimResponse> => {
  const response = await fetch("http://localhost:5000/api/v1/airdrop/github", {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({ access_token, airdrop_address }),
  });

  return response.json();
};

export const App: React.FC = () => {
  const initialColorMode = "dark";
  const [colorMode, _] = useState<ColorMode>(initialColorMode);
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [githubClaimInfo, setGithubClaimInfo] = useState<GithubClaim | null>(
    null
  );
  const [account, setAccount] = useState<string | null>(
    localStorage.getItem("namada_address")
  );
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
          const account = accounts[0].address;
          setAccount(account);
          localStorage.setItem("namada_address", account);
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
      getAccessToken(code).then((json) => {
        setIsGithubConnected(true);
        setGithubClaimInfo(json);
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
                <NamadaSection>
                  <Header>1. Get your Namada address</Header>
                  {!account && (
                    <Button
                      variant={ButtonVariant.Contained}
                      onClick={
                        namadaAttachStatus === "attached"
                          ? handleNamadaConnection
                          : handleDownloadExtension.bind(
                              null,
                              "https://namada.me"
                            )
                      }
                    >
                      {["attached", "pending"].includes(namadaAttachStatus)
                        ? "Connect to Namada"
                        : "Click to download the Namada extension"}
                    </Button>
                  )}
                  {account && (
                    <>
                      <HeaderTwo>Address:</HeaderTwo>
                      <Address>{account}</Address>
                      <Address>
                        <b>NOTE:</b> Please review if the address is correct.
                        Otherwise change the account in the extension and
                        <TextButton
                          onClick={() => {
                            localStorage.removeItem("namada_address");
                            handleNamadaConnection();
                          }}
                        >
                          {" "}
                          CLICK HERE TO RESET.
                        </TextButton>
                      </Address>
                    </>
                  )}
                </NamadaSection>
                <ClaimsSection>
                  {account && (
                    <>
                      <Header>2. Check your claims</Header>
                      <Claims>
                        <Claim>
                          {!githubClaimInfo && (
                            <Button
                              variant={ButtonVariant.Contained}
                              onClick={() =>
                                window.open(
                                  `https://github.com/login/oauth/authorize?client_id=Iv1.dbd15f7e1b50c0d7&redirect_uri=${redirectUrl}`,
                                  "_self"
                                )
                              }
                            >
                              With GitHub
                            </Button>
                          )}

                          {githubClaimInfo && (
                            <>
                              <HeaderTwo>With GitHub:</HeaderTwo>
                              <EligibilityInfo>
                                <ClaimLabel>Eligible: </ClaimLabel>
                                <ClaimValue>
                                  {githubClaimInfo.eligible ? "Yes" : "No"}
                                </ClaimValue>
                                <ClaimLabel>Amount: </ClaimLabel>
                                <ClaimValue>
                                  {githubClaimInfo.amount} NAM
                                </ClaimValue>
                              </EligibilityInfo>
                            </>
                          )}
                          {account &&
                            githubClaimInfo &&
                            githubClaimInfo.eligible &&
                            githubClaimInfo.github_token &&
                            !githubClaimInfo.claimed && (
                              <Button
                                variant={ButtonVariant.Contained}
                                onClick={() =>
                                  claimWithGithub(
                                    githubClaimInfo.github_token as string,
                                    account
                                  ).then((response) => {
                                    setGithubClaimInfo({
                                      ...githubClaimInfo,
                                      claimed: response.confirmed,
                                    });
                                  })
                                }
                              >
                                Claim
                              </Button>
                            )}
                          {githubClaimInfo && githubClaimInfo.claimed && (
                            <ClaimLabel>Claimed</ClaimLabel>
                          )}
                        </Claim>

                        <Claim>
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
                              ? "With cosmos"
                              : "Click to download the Keplr extension"}
                          </Button>
                        </Claim>
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

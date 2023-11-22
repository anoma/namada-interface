import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import {
  ActionButton,
  Checkbox,
  Heading,
  Stack,
  Text,
} from "@namada/components";
import {
  AnotherWays,
  AnotherWaysButtons,
  EligibilityContainer,
  EligibilitySection,
  EligibilitySectionWrapper,
  ModalButtonContainer,
  TOSToggle,
} from "./App.components";
import { useState } from "react";
import { MetamaskWindow } from "./types";
import {
  //TODO: rename to useExtensionDownload
  handleExtensionDownload,
  useKeplrHandler,
  useMetamaskHandler,
} from "./hooks";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { labelAtom } from "./state";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_GITHUB_CLIENT_ID: githubClientId = "",
} = process.env;

export const NonEligible: React.FC = () => {
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
  const keplr = (window as KeplrWindow)?.keplr;
  const metamask = (window as MetamaskWindow)?.ethereum;

  const metamaskHandler = useMetamaskHandler("0x1", metamask);
  const cosmosHandler = useKeplrHandler("cosmoshub-4", "cosmos", keplr);
  const osmosisHandler = useKeplrHandler("osmosis-1", "osmosis", keplr);
  const stargazeHandler = useKeplrHandler("stargaze-1", "badkids", keplr);
  const [label] = useAtom(labelAtom);
  const navigate = useNavigate();

  return (
    <EligibilityContainer>
      <EligibilitySectionWrapper>
        <EligibilitySection>
          <span>
            <Heading level={"h1"}>You are not eligible</Heading>
            <p>
              {"Sorry, you're not elibile for the RPGF Drop"}
              <br />
              {"with the"}{" "}
            </p>
          </span>
        </EligibilitySection>
      </EligibilitySectionWrapper>

      <AnotherWays>
        <Heading themeColor="primary" level={"h2"} size={"2xl"}>
          Try another way
        </Heading>
        <AnotherWaysButtons>
          <ActionButton
            outlined
            variant="primary"
            disabled={!isTOSAccepted}
            onClick={() => {
              window.open(
                `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUrl}`,
                "_self"
              );
            }}
          >
            Github
          </ActionButton>

          {metamask && (
            <ActionButton
              outlined
              disabled={!isTOSAccepted}
              variant="primary"
              onClick={metamaskHandler}
            >
              Ethereum Wallet
            </ActionButton>
          )}

          {!metamask && (
            <ModalButtonContainer>
              <ActionButton
                outlined
                variant="primary"
                onClick={() =>
                  handleExtensionDownload("https://metamask.io/download/")
                }
              >
                Download Metamask to use Ethereum Wallet
              </ActionButton>
              <Text themeColor="utility1" fontSize="xs">
                NOTE: Make sure to restart website after installing Metamask
                extension
              </Text>
            </ModalButtonContainer>
          )}

          <ActionButton
            outlined
            disabled={!isTOSAccepted}
            variant="primary"
            onClick={() => navigate("/trusted-setup")}
          >
            Namada Trusted Setup
          </ActionButton>

          {keplr && (
            <>
              <ActionButton
                outlined
                disabled={!isTOSAccepted}
                variant="primary"
                onClick={cosmosHandler}
              >
                Cosmos Wallet
              </ActionButton>

              <ActionButton
                outlined
                disabled={!isTOSAccepted}
                variant="primary"
                onClick={osmosisHandler}
              >
                Osmosis Wallet
              </ActionButton>

              <ActionButton
                outlined
                disabled={!isTOSAccepted}
                variant="primary"
                onClick={stargazeHandler}
              >
                Stargaze Wallet
              </ActionButton>
            </>
          )}

          {!keplr && (
            <ModalButtonContainer>
              <ActionButton
                outlined
                variant="primary"
                onClick={() =>
                  handleExtensionDownload("https://www.keplr.app/download")
                }
              >
                Download Keplr to use Cosmos/Osmosis/Stargaze Wallet
              </ActionButton>
              <Text themeColor="utility1" fontSize="xs">
                NOTE: Make sure to restart website after installing Keplr
                extension
              </Text>
            </ModalButtonContainer>
          )}

          <TOSToggle>
            <Checkbox
              checked={isTOSAccepted}
              onChange={() => setIsTOSAccepted(!isTOSAccepted)}
            />
            You agree to the Terms of Service and are not in the US or any other
            prohibited jurisdiction
          </TOSToggle>
        </AnotherWaysButtons>
      </AnotherWays>
    </EligibilityContainer>
  );
};

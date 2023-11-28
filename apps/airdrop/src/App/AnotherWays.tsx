import { Window as KeplrWindow } from "@keplr-wallet/types";
import { ActionButton, Heading, Text } from "@namada/components";
import { useNavigate } from "react-router-dom";
import {
  AnotherWaysButtons,
  AnotherWaysContainer,
  ModalButtonContainer,
} from "./App.components";
import { CosmosIcon } from "./Icons/CosmosIcon";
import { EthereumIcon } from "./Icons/EthereumIcon";
import { GithubIcon } from "./Icons/GithubIcon";
import { OsmosisIcon } from "./Icons/OsmosisIcon";
import { StargazerIcon } from "./Icons/StargazerIcon";
import { TrustedSetupIcon } from "./Icons/TrustedSetupIcon";
import {
  //TODO: rename to useExtensionDownload
  handleExtensionDownload,
  useKeplrHandler,
  useMetamaskHandler,
} from "./hooks";
import { MetamaskWindow } from "./types";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_GITHUB_CLIENT_ID: githubClientId = "",
} = process.env;

export const AnotherWays: React.FC = () => {
  const keplr = (window as KeplrWindow)?.keplr;
  const metamask = (window as MetamaskWindow)?.ethereum;
  const metamaskHandler = useMetamaskHandler("0x1", metamask);
  const cosmosHandler = useKeplrHandler("cosmoshub-4", "cosmos", keplr);
  const osmosisHandler = useKeplrHandler("osmosis-1", "osmosis", keplr);
  const stargazeHandler = useKeplrHandler("stargaze-1", "badkids", keplr);
  const navigate = useNavigate();

  return (
    <AnotherWaysContainer>
      <Heading themeColor="primary" level={"h2"} size={"2xl"}>
        Try another way
      </Heading>
      <AnotherWaysButtons>
        <ActionButton
          outlined
          variant="primary"
          icon={<GithubIcon />}
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
            variant="primary"
            onClick={metamaskHandler}
            icon={<EthereumIcon />}
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
          variant="primary"
          icon={<TrustedSetupIcon />}
          onClick={() => navigate("/trusted-setup")}
        >
          Trusted Setup
        </ActionButton>

        {keplr && (
          <>
            <ActionButton
              outlined
              variant="primary"
              icon={<CosmosIcon />}
              onClick={cosmosHandler}
            >
              Cosmos Wallet
            </ActionButton>

            <ActionButton
              outlined
              variant="primary"
              icon={<OsmosisIcon />}
              onClick={osmosisHandler}
            >
              Osmosis Wallet
            </ActionButton>

            <ActionButton
              outlined
              variant="primary"
              icon={<StargazerIcon />}
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
      </AnotherWaysButtons>
    </AnotherWaysContainer>
  );
};

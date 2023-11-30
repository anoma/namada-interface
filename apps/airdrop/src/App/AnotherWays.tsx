import { Window as KeplrWindow } from "@keplr-wallet/types";
import { ActionButton, Heading } from "@namada/components";
import { useNavigate } from "react-router-dom";
import {
  AnotherWaysButtons,
  AnotherWaysContainer,
  ModalButtonContainer,
  ModalButtonText,
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
import { AcceptTermsCheckbox } from "./Common/AcceptTermsCheckbox";
import { useState } from "react";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_GITHUB_CLIENT_ID: githubClientId = "",
} = process.env;

type AnotherWaysProps = {
  title: string;
  className?: string;
};

export const AnotherWays: React.FC<AnotherWaysProps> = (props) => {
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
  const keplr = (window as KeplrWindow)?.keplr;
  const metamask = (window as MetamaskWindow)?.ethereum;
  const metamaskHandler = useMetamaskHandler("0x1", metamask);
  const cosmosHandler = useKeplrHandler("cosmoshub-4", "cosmos", keplr);
  const osmosisHandler = useKeplrHandler("osmosis-1", "osmosis", keplr);
  const stargazeHandler = useKeplrHandler("stargaze-1", "badkids", keplr);
  const navigate = useNavigate();
  const columns = !metamask && !keplr ? "1fr 1fr" : "1fr 1fr 1fr";

  return (
    <AnotherWaysContainer className={props.className}>
      <Heading themeColor="primary" level={"h2"} size={"2xl"}>
        {props.title}
      </Heading>
      <AnotherWaysButtons columns={columns}>
        <ActionButton
          outlined
          disabled={!isTOSAccepted}
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
            disabled={!isTOSAccepted}
            variant="primary"
            onClick={metamaskHandler}
            icon={<EthereumIcon />}
          >
            Ethereum Wallet
          </ActionButton>
        )}

        <ActionButton
          outlined
          disabled={!isTOSAccepted}
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
              disabled={!isTOSAccepted}
              variant="primary"
              icon={<CosmosIcon />}
              onClick={cosmosHandler}
            >
              Cosmos Wallet
            </ActionButton>

            <ActionButton
              outlined
              disabled={!isTOSAccepted}
              variant="primary"
              icon={<OsmosisIcon />}
              onClick={osmosisHandler}
            >
              Osmosis Wallet
            </ActionButton>

            <ActionButton
              outlined
              disabled={!isTOSAccepted}
              variant="primary"
              icon={<StargazerIcon />}
              onClick={stargazeHandler}
            >
              Stargaze Wallet
            </ActionButton>
          </>
        )}

        {!metamask && (
          <ModalButtonContainer>
            <ActionButton
              outlined
              disabled={!isTOSAccepted}
              variant="primary"
              onClick={() =>
                handleExtensionDownload("https://metamask.io/download/")
              }
            >
              Download Metamask to use Ethereum Wallet
            </ActionButton>
            <ModalButtonText
              disabled={!isTOSAccepted}
              themeColor="primary"
              fontSize="xs"
            >
              NOTE: Make sure to restart website after installing Metamask
              extension
            </ModalButtonText>
          </ModalButtonContainer>
        )}

        {!keplr && (
          <ModalButtonContainer>
            <ActionButton
              outlined
              disabled={!isTOSAccepted}
              variant="primary"
              onClick={() =>
                handleExtensionDownload("https://www.keplr.app/download")
              }
            >
              Download Keplr to use Cosmos/Osmosis/Stargaze Wallet
            </ActionButton>
            <ModalButtonText
              disabled={!isTOSAccepted}
              themeColor="primary"
              fontSize="xs"
            >
              NOTE: Make sure to restart website after installing Keplr
              extension
            </ModalButtonText>
          </ModalButtonContainer>
        )}
      </AnotherWaysButtons>

      <AcceptTermsCheckbox
        checked={isTOSAccepted}
        onChange={() => setIsTOSAccepted(!isTOSAccepted)}
      />
    </AnotherWaysContainer>
  );
};

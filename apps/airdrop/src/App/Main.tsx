import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import {
  ActionButton,
  Checkbox,
  Heading,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Common/Modal";
import {
  ButtonContainer,
  CallToActionStack,
  EligibilityPanel,
  GlobalStyles,
  IconContainer,
  MainContainer,
  MainFooter,
  MainHeader,
  MainSection,
  MainSectionButton,
  MainTopSection,
  ModalButtonContainer,
  ObjectsContainer,
  PoolContainer,
  PoolTopLayerContainer,
  SmallWarning,
  TOSToggle,
} from "./App.components";
import { Countdown } from "./Countdown";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { PageFooter } from "./Common/PageFooter";
import { EyeSvg } from "./Graphics/Eye";
import { HiveSvg } from "./Graphics/Hive";
import { MetamaskWindow } from "./types";
import {
  //TODO: rename to useExtensionDownload
  handleExtensionDownload,
  useGithubHandler,
  useKeplrHandler,
  useMetamaskHandler,
} from "./hooks";
import { BallSVg } from "./Graphics/Ball";
import { WireSvg } from "./Graphics/Wire";
import { Bars2Svg } from "./Graphics/Bars2";
import { Bars1Svg } from "./Graphics/Bars1";
import { ZeroOneSvg } from "./Graphics/ZeroOne";
import { GithubIcon } from "./Icons/GithubIcon";
import { EthereumIcon } from "./Icons/EthereumIcon";
import { TrustedSetupIcon } from "./Icons/TrustedSetupIcon";
import { StargazerIcon } from "./Icons/StargazerIcon";
import { OsmosisIcon } from "./Icons/OsmosisIcon";
import { CosmosIcon } from "./Icons/CosmosIcon";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  REACT_APP_GITHUB_CLIENT_ID: githubClientId = "",
} = process.env;

export const Main: React.FC = () => {
  const [keplr, setKeplr] = useState<Keplr | undefined>();
  const [metamask, setMetamask] = useState<MetaMaskInpageProvider>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
  const navigate = useNavigate();
  const metamaskHandler = useMetamaskHandler("0x1", metamask);
  const cosmosHandler = useKeplrHandler("cosmoshub-4", "cosmos", keplr);
  const osmosisHandler = useKeplrHandler("osmosis-1", "osmosis", keplr);
  const stargazeHandler = useKeplrHandler("stargaze-1", "badkids", keplr);
  const githubHandler = useGithubHandler();

  const url = window.location.href;
  const hasCode = url.includes("?code=");

  useEffect(() => {
    if (hasCode) {
      const code = url.split("?code=")[1];
      githubHandler(code);
    }
  }, []);

  return (
    <>
      <MainContainer blurred={isModalOpen}>
        <GlobalStyles colorMode="light" />
        <MainTopSection>
          <MainSection>
            <Stack gap={4}>
              <MainHeader>
                <Heading uppercase level={"h1"} size={"7xl"}>
                  No<span> Privacy</span>
                  <br />
                  Without
                  <br />
                  Public Goods
                </Heading>
              </MainHeader>
              <CallToActionStack>
                <Stack gap={1}>
                  <Text fontSize="xl">TIME LEFT TO CLAIM:</Text>
                  <Text fontSize="2xl">
                    <Countdown endDate={new Date("Nov 14, 2023 13:00:00")} />
                  </Text>
                </Stack>
                <ButtonContainer>
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    borderRadius="sm"
                    onClick={() => {
                      setIsModalOpen(true);
                      setKeplr((window as KeplrWindow)?.keplr);
                      setMetamask((window as MetamaskWindow)?.ethereum);
                    }}
                  >
                    Check NAM eligibility
                  </ActionButton>
                </ButtonContainer>
              </CallToActionStack>
              <SmallWarning>
                Please check you are claiming using the following URL:
                <div>
                  <strong>https://rpgfdrop.namada.net</strong>
                </div>
              </SmallWarning>
              <Stack gap={0.5}>
                <MainSectionButton></MainSectionButton>
                <LinkButton themeColor="utility2">
                  <b>Read the annoucement</b>
                </LinkButton>
              </Stack>
            </Stack>
          </MainSection>
          <PoolContainer>
            <PoolSvg />
          </PoolContainer>
          <PoolTopLayerContainer>
            <PoolTopLayer />
          </PoolTopLayerContainer>
          <ObjectsContainer>
            <IconContainer left={-310} top={-320}>
              <BallSVg />
            </IconContainer>
            <IconContainer left={255} top={-330}>
              <HiveSvg />
            </IconContainer>
            <IconContainer left={-425} top={-225}>
              <WireSvg />
            </IconContainer>
            <IconContainer left={380} top={-235}>
              <Bars2Svg />
            </IconContainer>
            <IconContainer left={-540} top={-15}>
              <Bars1Svg />
            </IconContainer>
            <IconContainer left={350} top={-75}>
              <ZeroOneSvg />
            </IconContainer>
            <IconContainer left={305} top={10}>
              <EyeSvg />
            </IconContainer>
          </ObjectsContainer>
        </MainTopSection>
        <MainFooter>
          <Stack gap={6}>
            <Text fontSize={"3xl"}>Namada RPGF Drop</Text>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              semper tempor ante eu ullamcorper. Morbi fringilla gravida mi in
              cursus. Donec libero velit, vulputate vel nunc sed, pretium
              rhoncus quam.
            </Text>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              semper tempor ante eu ullamcorper. Morbi fringilla gravida mi in
              cursus. Donec libero velit, vulputate vel nunc sed, pretium
              rhoncus quam.
            </Text>
          </Stack>
        </MainFooter>
        <PageFooter />
      </MainContainer>
      <Modal
        isOpen={isModalOpen}
        title="Check eligibility with:"
        onClose={() => setIsModalOpen(false)}
      >
        <EligibilityPanel>
          <Stack gap={3}>
            <ActionButton
              outlined
              variant="primary"
              disabled={!isTOSAccepted}
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
              icon={<TrustedSetupIcon />}
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
                  icon={<CosmosIcon />}
                >
                  Cosmos Wallet
                </ActionButton>

                <ActionButton
                  outlined
                  disabled={!isTOSAccepted}
                  variant="primary"
                  onClick={osmosisHandler}
                  icon={<OsmosisIcon />}
                >
                  Osmosis Wallet
                </ActionButton>

                <ActionButton
                  outlined
                  disabled={!isTOSAccepted}
                  variant="primary"
                  onClick={stargazeHandler}
                  icon={<StargazerIcon />}
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
              You agree to the Terms of Service and are not in the US or any
              other prohibited jurisdiction
            </TOSToggle>
          </Stack>
        </EligibilityPanel>
      </Modal>
    </>
  );
};

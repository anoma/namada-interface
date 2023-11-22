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
  CallToActionStack,
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
  TOSToggle,
} from "./App.components";
import { Countdown } from "./Countdown";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { PageFooter } from "./Common/PageFooter";
import { BookSvg } from "./Graphics/Book";
import { EyeSvg } from "./Graphics/Eye";
import { HiveSvg } from "./Graphics/Hive";
import { ShieldSvg } from "./Graphics/Shield";
import { RustSvg } from "./Graphics/Rust";
import { MetamaskWindow } from "./types";
import {
  //TODO: rename to useExtensionDownload
  handleExtensionDownload,
  useGithubHandler,
  useKeplrHandler,
  useMetamaskHandler,
} from "./hooks";

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
        <MainTopSection>
          <MainSection>
            <Stack gap={6}>
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
                <Text fontSize="xl">TIME LEFT TO CLAIM:</Text>
                <Text fontSize="2xl">
                  <Countdown endDate={new Date("Nov 14, 2023 13:00:00")} />
                </Text>
                <ActionButton
                  variant="secondary"
                  onClick={() => {
                    setIsModalOpen(true);
                    setKeplr((window as KeplrWindow)?.keplr);
                    setMetamask((window as MetamaskWindow)?.ethereum);
                  }}
                >
                  Check NAM eligibility
                </ActionButton>
              </CallToActionStack>
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
            <IconContainer left={-430} top={-200}>
              <BookSvg />
            </IconContainer>

            <IconContainer left={-550} top={0}>
              <EyeSvg />
            </IconContainer>

            <IconContainer left={280} top={-300}>
              <HiveSvg />
            </IconContainer>

            <IconContainer left={420} top={-100}>
              <ShieldSvg />
            </IconContainer>

            <IconContainer left={320} top={80}>
              <RustSvg />
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
        <Stack gap={4}>
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
        </Stack>
      </Modal>
    </>
  );
};

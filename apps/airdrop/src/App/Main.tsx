import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import {
  ActionButton,
  Heading,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { useEffect, useState } from "react";
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
  ModalButtonText,
  ObjectsContainer,
  PoolContainer,
  PoolTopLayerContainer,
  SmallWarning,
} from "./App.components";
import { GithubButton } from "./Buttons/GithubButton";
import { MetamaskButton } from "./Buttons/MetamaskButton";
import { TrustedSetupButton } from "./Buttons/TrustedSetupButton";
import { AcceptTermsCheckbox } from "./Common/AcceptTermsCheckbox";
import { Modal } from "./Common/Modal";
import { PageFooter } from "./Common/PageFooter";
import { Countdown } from "./Countdown";
import { BallSVg } from "./Graphics/Ball";
import { Bars1Svg } from "./Graphics/Bars1";
import { Bars2Svg } from "./Graphics/Bars2";
import { EyeSvg } from "./Graphics/Eye";
import { HiveSvg } from "./Graphics/Hive";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { WireSvg } from "./Graphics/Wire";
import { ZeroOneSvg } from "./Graphics/ZeroOne";
import { CosmosIcon } from "./Icons/CosmosIcon";
import { OsmosisIcon } from "./Icons/OsmosisIcon";
import { StargazerIcon } from "./Icons/StargazerIcon";
import {
  //TODO: rename to useExtensionDownload
  handleExtensionDownload,
  useGithubHandler,
  useKeplrHandler,
} from "./hooks";
import { MetamaskWindow } from "./types";

export const Main: React.FC = () => {
  const [keplr, setKeplr] = useState<Keplr | undefined>();
  const [metamask, setMetamask] = useState<MetaMaskInpageProvider>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
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
                <Heading
                  themeColor="utility1"
                  uppercase
                  level={"h1"}
                  size={"7xl"}
                >
                  No<span> Privacy</span>
                  <br />
                  Without
                  <br />
                  Public Goods
                </Heading>
              </MainHeader>
              <CallToActionStack>
                <Stack gap={1}>
                  <Text themeColor="utility1" fontSize="xl">
                    TIME LEFT TO CLAIM:
                  </Text>
                  <Text themeColor="utility1" fontSize="2xl">
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
                <LinkButton themeColor="utility1">
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
            <IconContainer left={-310} top={50}>
              <BallSVg />
            </IconContainer>
            <IconContainer left={255} top={40}>
              <HiveSvg />
            </IconContainer>
            <IconContainer left={-425} top={156}>
              <WireSvg />
            </IconContainer>
            <IconContainer left={380} top={150}>
              <Bars2Svg />
            </IconContainer>
            <IconContainer left={-540} top={380}>
              <Bars1Svg />
            </IconContainer>
            <IconContainer left={350} top={306}>
              <ZeroOneSvg />
            </IconContainer>
            <IconContainer left={305} top={377}>
              <EyeSvg />
            </IconContainer>
          </ObjectsContainer>
        </MainTopSection>
        <MainFooter>
          <Stack gap={6}>
            <Heading
              themeColor="utility1"
              size={"3xl"}
              level="h2"
              fontWeight="400"
            >
              Namada RPGF Drop
            </Heading>
            <Text themeColor="utility1" fontWeight="400">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
              semper tempor ante eu ullamcorper. Morbi fringilla gravida mi in
              cursus. Donec libero velit, vulputate vel nunc sed, pretium
              rhoncus quam.
            </Text>
            <Text themeColor="utility1" fontWeight="400">
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
            <GithubButton disabled={!isTOSAccepted} />
            <MetamaskButton disabled={!isTOSAccepted} />

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

            <TrustedSetupButton disabled={!isTOSAccepted} />
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

            <AcceptTermsCheckbox
              checked={isTOSAccepted}
              onChange={() => setIsTOSAccepted(!isTOSAccepted)}
            />
          </Stack>
        </EligibilityPanel>
      </Modal>
    </>
  );
};

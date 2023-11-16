import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import {
  ActionButton,
  ButtonVariant,
  Checkbox,
  Heading,
  LinkButton,
  Stack,
  Text,
  Toggle,
} from "@namada/components";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "./Common/Modal";
import {
  CallToActionStack,
  IconContainer,
  KeplrButtonContainer,
  MainContainer,
  MainFooter,
  MainHeader,
  MainModal,
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
import { KeplrClaimType, claimAtom, confirmationAtom } from "./state";
import {
  AirdropResponse,
  airdropFetch,
  navigatePostCheck,
  toast,
} from "./utils";
import { PoolSvg } from "./Graphics/Pool";
import { PoolTopLayer } from "./Graphics/PoolTopLayer";
import { PageFooter } from "./Common/PageFooter";
import { BookSvg } from "./Graphics/Book";
import { EyeSvg } from "./Graphics/Eye";
import { HiveSvg } from "./Graphics/Hive";
import { ShieldSvg } from "./Graphics/Shield";
import { RustSvg } from "./Graphics/Rust";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  AIRDROP_BACKEND_SERVICE_URL: backendUrl = "",
} = process.env;

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  has_claimed: boolean;
  airdrop_address?: string;
  eligibilities: string[];
  github_username?: string;
};

type Claim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  nonce: string;
};

const checkGithubClaim = async (
  code: string
): Promise<AirdropResponse<GithubClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/github/${code}`, {
    method: "GET",
  });
};

const checkClaim = async (
  address: string,
  type: KeplrClaimType | "gitcoin"
): Promise<AirdropResponse<Claim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/${type}/${address}`, {
    method: "GET",
  });
};

export const Main: React.FC = () => {
  const [keplr, setKeplr] = useState<Keplr | undefined>();
  const [metamask, setMetamask] = useState<
    MetaMaskInpageProvider | undefined
  >();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isTOSAccepted, setIsTOSAccepted] = useState(false);
  const [_cl, setClaimState] = useAtom(claimAtom);
  const [_co, setConfirmation] = useAtom(confirmationAtom);
  const navigate = useNavigate();

  const url = window.location.href;
  const hasCode = url.includes("?code=");

  useEffect(() => {
    if (hasCode) {
      (async () => {
        const code = url.split("?code=")[1];
        let response: AirdropResponse<GithubClaim> | undefined;
        //TODO: generic error handling
        try {
          response = await checkGithubClaim(code);
        } catch (e) {
          console.error(e);
          navigate("/", { replace: true });
        }

        if (!response) {
          toast("Something went wrong, please try again later");
          return;
        } else if (!response.ok) {
          toast(response.result.message);
          return;
        }
        const claim = response.result;

        if (claim.eligible && !claim.has_claimed) {
          setClaimState({
            eligible: claim.eligible,
            amount: claim.amount,
            githubToken: claim.github_token as string,
            githubUsername: claim.github_username as string,
            hasClaimed: claim.has_claimed,
            type: "github",
          });
        } else if (claim.eligible && claim.has_claimed) {
          setConfirmation({
            confirmed: true,
            address: claim.airdrop_address as string,
            amount: claim.amount,
          });
        }

        navigatePostCheck(navigate, claim.eligible, claim.has_claimed, true);
      })();
    }
  }, []);

  //TODO: useCallback
  const handleKeplrConnection = async (
    type: KeplrClaimType,
    chainId: string
  ): Promise<void> => {
    if (!keplr) {
      handleExtensionDownload("https://www.keplr.app/download");
    } else {
      try {
        await keplr.enable(chainId);
      } catch (e) {
        alert("Please install Keplr extension and refresh the website");
      }

      const { bech32Address: address } = await keplr.getKey(chainId);

      let response: AirdropResponse<Claim> | undefined;
      try {
        response = await checkClaim(address, type);
      } catch (e) {
        console.error(e);
      }

      if (!response) {
        toast("Something went wrong, please try again later");
        return;
      } else if (!response.ok) {
        toast(response.result.message);
        return;
      }
      const claim = response.result;

      if (claim.eligible && !claim.has_claimed) {
        const signature = await keplr?.signArbitrary(
          chainId,
          address,
          claim.nonce
        );
        setClaimState({
          eligible: claim.eligible,
          amount: claim.amount,
          hasClaimed: claim.has_claimed,
          type,
          signature: { ...signature, pubKey: signature.pub_key },
          address,
          nonce: claim.nonce,
        });
      } else if (claim.eligible && claim.has_claimed) {
        setConfirmation({
          confirmed: true,
          address: claim.airdrop_address as string,
          amount: claim.amount,
        });
      }

      navigatePostCheck(navigate, claim.eligible, claim.has_claimed);
    }
  };

  //TODO: useCallback
  const handleMetamaskConnection = async (chainId: string): Promise<void> => {
    if (!metamask) {
      handleExtensionDownload("https://metamask.io/download/");
    } else {
      await metamask.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });

      const addresses = await metamask.request<string[]>({
        method: "eth_requestAccounts",
      });

      if (!addresses || !addresses[0]) {
        throw new Error("No address found");
      }
      const address = addresses[0];

      let response: AirdropResponse<Claim> | undefined;
      try {
        response = await checkClaim(address, "gitcoin");
      } catch (e) {
        console.error(e);
      }
      if (!response) {
        toast("Something went wrong, please try again later");
        return;
      } else if (!response.ok) {
        toast(response.result.message);
        return;
      }
      const { result } = response;

      if (result.eligible && !result.has_claimed) {
        const signature = await metamask.request<string>({
          method: "personal_sign",
          params: [result.nonce, address],
        });

        if (!signature) {
          throw new Error("Can't sign message");
        }

        setClaimState({
          eligible: result.eligible,
          amount: result.amount,
          hasClaimed: result.has_claimed,
          signature,
          address,
          nonce: result.nonce,
          type: "gitcoin",
        });
      } else if (result.eligible && result.has_claimed) {
        setConfirmation({
          confirmed: true,
          address: result.airdrop_address as string,
          amount: result.amount,
        });
      }

      navigatePostCheck(navigate, result.eligible, result.has_claimed);
    }
  };

  const handleExtensionDownload = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
                `https://github.com/login/oauth/authorize?client_id=Iv1.dbd15f7e1b50c0d7&redirect_uri=${redirectUrl}`,
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
              onClick={() => handleMetamaskConnection("0x1")}
            >
              Gitcoin Wallet
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
                Download Metamask to use Gitcoin Wallet
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
                onClick={() => handleKeplrConnection("cosmos", "cosmoshub-4")}
              >
                Cosmos Wallet
              </ActionButton>

              <ActionButton
                outlined
                disabled={!isTOSAccepted}
                variant="primary"
                onClick={() => handleKeplrConnection("osmosis", "osmosis-1")}
              >
                Osmosis Wallet
              </ActionButton>

              <ActionButton
                outlined
                disabled={!isTOSAccepted}
                variant="primary"
                onClick={() => handleKeplrConnection("badkids", "stargaze-1")}
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

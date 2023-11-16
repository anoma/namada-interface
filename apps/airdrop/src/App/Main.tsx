import { Window as KeplrWindow, Keplr } from "@keplr-wallet/types";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import {
  Button,
  ButtonVariant,
  Heading,
  Modal,
  Toggle,
  Text,
  LinkButton,
  Stack,
} from "@namada/components";
import {
  Divider,
  KeplrButtonContainer,
  MainContainer,
  MainFooter,
  MainHeader,
  MainModal,
  MainSection,
  MainSectionButton,
  TOSToggle,
} from "./App.components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeplrClaimType, confirmationAtom, claimAtom } from "./state";
import { useAtom } from "jotai";
import {
  AirdropResponse,
  airdropFetch,
  navigatePostCheck,
  toast,
} from "./utils";
import { Countdown } from "./Countdown";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <MainContainer>
      <MainSection>
        <Stack gap={2}>
          <MainHeader>
            <Heading level={"h1"} size={"6xl"}>
              <b>
                No<span> Privacy</span>
                <br />
                Without
                <br />
                Public Goods
              </b>
            </Heading>
          </MainHeader>
          <Stack gap={0.5}>
            <Text>
              <b>TIME LEFT TO CLAIM:</b>
            </Text>
            <Text fontSize="2xl">
              <b>
                <Countdown endDate={new Date("Nov 20, 2023 00:00:00")} />
              </b>
            </Text>
          </Stack>

          <Stack gap={0.5}>
            <MainSectionButton>
              <Button
                variant={ButtonVariant.Contained}
                onClick={() => {
                  setIsModalOpen(true);
                  setKeplr((window as KeplrWindow)?.keplr);
                  setMetamask((window as MetamaskWindow)?.ethereum);
                }}
              >
                <b>Check NAM eligibility</b>
              </Button>
            </MainSectionButton>
            <LinkButton themeColor="utility2">
              <b>Read the annoucement</b>
            </LinkButton>
          </Stack>
        </Stack>
      </MainSection>
      <MainFooter>
        <Divider />
        <Stack gap={4}>
          <Text fontSize={"3xl"}>Namada RPGF Drop</Text>
          <Text>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris
            semper tempor ante eu ullamcorper. Morbi fringilla gravida mi in
            cursus. Donec libero velit, vulputate vel nunc sed, pretium rhoncus
            quam.
          </Text>
        </Stack>
      </MainFooter>
      <Modal
        isOpen={isModalOpen}
        title="Check eligibility with:"
        onBackdropClick={() => setIsModalOpen(false)}
      >
        <MainModal>
          <Button
            variant={ButtonVariant.Contained}
            disabled={!isTOSAccepted}
            onClick={() => {
              window.open(
                `https://github.com/login/oauth/authorize?client_id=Iv1.dbd15f7e1b50c0d7&redirect_uri=${redirectUrl}`,
                "_self"
              );
            }}
          >
            Github
          </Button>
          {metamask && (
            <Button
              disabled={!isTOSAccepted}
              variant={ButtonVariant.Contained}
              onClick={() => handleMetamaskConnection("0x1")}
            >
              Gitcoin Wallet
            </Button>
          )}
          {!metamask && (
            <>
              <Button
                variant={ButtonVariant.Contained}
                onClick={() =>
                  handleExtensionDownload("https://metamask.io/download/")
                }
              >
                Download Metamask to use Gitcoin Wallet
              </Button>
              <span style={{ color: "white" }}>
                <b>NOTE: </b>Make sure to restart website after installing
                Metamask extension
              </span>
            </>
          )}
          <Button
            disabled={!isTOSAccepted}
            variant={ButtonVariant.Contained}
            onClick={() => navigate("/trusted-setup")}
          >
            Namada Trusted Setup
          </Button>
          {keplr && (
            <>
              <Button
                disabled={!isTOSAccepted}
                variant={ButtonVariant.Contained}
                onClick={() => handleKeplrConnection("cosmos", "cosmoshub-4")}
              >
                Cosmos Wallet
              </Button>
              <Button
                disabled={!isTOSAccepted}
                variant={ButtonVariant.Contained}
                onClick={() => handleKeplrConnection("osmosis", "osmosis-1")}
              >
                Osmosis Wallet
              </Button>
              <Button
                disabled={!isTOSAccepted}
                variant={ButtonVariant.Contained}
                onClick={() => handleKeplrConnection("badkids", "stargaze-1")}
              >
                Stargaze Wallet
              </Button>
            </>
          )}
          {!keplr && (
            <KeplrButtonContainer>
              <Button
                variant={ButtonVariant.Contained}
                onClick={() =>
                  handleExtensionDownload("https://www.keplr.app/download")
                }
              >
                Download Keplr to use Cosmos/Osmosis/Stargaze Wallet
              </Button>
              <span style={{ color: "white" }}>
                <b>NOTE: </b>Make sure to restart website after installing Keplr
                extension
              </span>
            </KeplrButtonContainer>
          )}

          <TOSToggle>
            <Toggle
              checked={isTOSAccepted}
              onClick={() => setIsTOSAccepted(!isTOSAccepted)}
            />
            You agree to the Terms of Service and are not in the US or any other
            prohibited jurisdiction
          </TOSToggle>
        </MainModal>
      </Modal>
    </MainContainer>
  );
};

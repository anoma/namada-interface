import { Window as KeplrWindow } from "@keplr-wallet/types";
import {
  Button,
  ButtonVariant,
  Heading,
  Modal,
  Toggle,
} from "@namada/components";
import {
  MainContainer,
  MainFooter,
  MainHeader,
  MainModal,
  MainSection,
  MainSectionTime,
  TOSToggle,
} from "./App.components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeplrClaimType, confirmationAtom, claimAtom } from "./state";
import { useAtom } from "jotai";
import { navigatePostCheck } from "./utils";
import { Countdown } from "./Countdown";

const {
  REACT_APP_REDIRECT_URI: redirectUrl = "",
  AIRDROP_BACKEND_SERVICE_URL: backendUrl = "",
} = process.env;

type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  has_claimed: boolean;
  airdrop_address?: string;
  eligibilities: string[];
};

type KeplrClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  nonce: string;
};

const checkGithubClaim = async (code: string): Promise<GithubClaim> => {
  const response = await fetch(`${backendUrl}/api/v1/airdrop/github/${code}`, {
    method: "GET",
  });
  const json = await response.json();

  return json;
};

const checkClaim = async (
  address: string,
  type: KeplrClaimType
): Promise<KeplrClaim> => {
  const response = await fetch(
    `${backendUrl}/api/v1/airdrop/${type}/${address}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

export const Main: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggleChecked, setIsToggleChecked] = useState(false);
  const [_cl, setClaimState] = useAtom(claimAtom);
  const [_co, setConfirmation] = useAtom(confirmationAtom);
  const navigate = useNavigate();

  const url = window.location.href;
  const hasCode = url.includes("?code=");

  useEffect(() => {
    if (hasCode) {
      (async () => {
        const code = url.split("?code=")[1];
        const response = await checkGithubClaim(code);
        if (response.eligible && !response.has_claimed) {
          setClaimState({
            eligible: response.eligible,
            amount: response.amount,
            githubToken: response.github_token as string,
            hasClaimed: response.has_claimed,
            type: "github",
          });
        } else if (response.eligible && response.has_claimed) {
          setConfirmation({
            confirmed: true,
            address: response.airdrop_address as string,
            amount: response.amount,
          });
        }

        navigatePostCheck(
          navigate,
          response.eligible,
          response.has_claimed,
          true
        );
      })();
    }
  }, []);

  const handleKeplrConnection = async (
    type: KeplrClaimType,
    chainId: string
  ): Promise<void> => {
    const keplr = (window as KeplrWindow).keplr;
    if (!keplr) {
      //TODO: proper handling
      throw new Error("Keplr extension not installed");
    }
    await keplr.enable(chainId);

    const { bech32Address: address } = await keplr.getKey(chainId);
    const response = await checkClaim(address, type);
    if (response.eligible && !response.has_claimed) {
      const signature = await keplr?.signArbitrary(
        chainId,
        address,
        response.nonce
      );
      setClaimState({
        eligible: response.eligible,
        amount: response.amount,
        hasClaimed: response.has_claimed,
        type,
        signature: { ...signature, pubKey: signature.pub_key },
        address,
        nonce: response.nonce,
      });
    }
    navigatePostCheck(navigate, response.eligible, response.has_claimed);
  };

  return (
    <MainContainer>
      <MainHeader>
        <Heading level={"h1"}>
          No Privacy
          <br />
          Without Public Goods
        </Heading>
      </MainHeader>
      <MainSection>
        <MainSectionTime>Time left to claim:</MainSectionTime>
        <MainSectionTime>
          <Countdown endDate={new Date("Nov 14, 2023 13:00:00")} />
        </MainSectionTime>
        <Button
          variant={ButtonVariant.Contained}
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Check NAM eligibility
        </Button>
        <Button variant={ButtonVariant.Contained} disabled={true}>
          Read annoucement
        </Button>
      </MainSection>
      <MainFooter>
        <Heading level={"h1"}>Namada RPGF Drop</Heading>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris semper
          tempor ante eu ullamcorper. Morbi fringilla gravida mi in cursus.
          Donec libero velit, vulputate vel nunc sed, pretium rhoncus quam.
        </p>
      </MainFooter>
      <Modal
        isOpen={isModalOpen}
        title="Check eligibility with:"
        onBackdropClick={() => setIsModalOpen(false)}
      >
        <MainModal>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => {
              window.open(
                `https://github.com/login/oauth/authorize?client_id=Iv1.dbd15f7e1b50c0d7&redirect_uri=${redirectUrl}`,
                "_self"
              );
            }}
          >
            Github
          </Button>
          <Button disabled={true} variant={ButtonVariant.Contained}>
            Ethereum Wallet
          </Button>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => navigate("/trusted-setup")}
          >
            Namada Trusted Setup
          </Button>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => handleKeplrConnection("cosmos", "cosmoshub-4")}
          >
            Cosmos Wallet
          </Button>
          <Button
            variant={ButtonVariant.Contained}
            onClick={() => handleKeplrConnection("osmosis", "osmosis-1")}
          >
            Osmosis Wallet
          </Button>
          <Button disabled={true} variant={ButtonVariant.Contained}>
            Stargaze Wallet
          </Button>
          <TOSToggle>
            <Toggle
              checked={isToggleChecked}
              onClick={() => setIsToggleChecked(!isToggleChecked)}
            />
            You agree to the Terms of Service and are not in the US or any other
            prohibited jurisdiction
          </TOSToggle>
        </MainModal>
      </Modal>
    </MainContainer>
  );
};

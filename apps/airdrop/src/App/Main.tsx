import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
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
import { githubAtom } from "./state";
import { useAtom } from "jotai";

const { REACT_APP_REDIRECT_URI: redirectUrl = "" } = process.env;

type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  has_claimed: boolean;
};

const getGithubClaimInfo = async (code: string): Promise<GithubClaim> => {
  const response = await fetch(
    `http://localhost:5000/api/v1/airdrop/github/${code}`,
    {
      method: "GET",
    }
  );
  const json = await response.json();

  return { ...json, has_claimed: false };
};

export const Main: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggleChecked, setIsToggleChecked] = useState(false);
  const [_github, setGithub] = useAtom(githubAtom);
  const navigate = useNavigate();

  const url = window.location.href;
  const hasCode = url.includes("?code=");

  useEffect(() => {
    if (hasCode) {
      (async () => {
        const code = url.split("?code=")[1];
        const response = await getGithubClaimInfo(code);
        if (response.eligible) {
          setGithub({
            eligible: response.eligible,
            amount: response.amount,
            githubToken: response.github_token,
            hasClaimed: response.has_claimed,
          });
          navigate("/eligible-with-github");
        } else {
          navigate("/not-eligible");
        }
      })();
    }
  }, []);

  return (
    <MainContainer>
      <MainHeader>
        <Heading level={HeadingLevel.One}>
          No Privacy
          <br />
          Without Public Goods
        </Heading>
      </MainHeader>
      <MainSection>
        <MainSectionTime>Time left to claim:</MainSectionTime>
        <MainSectionTime>XXD : XXH : XXM</MainSectionTime>
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
        <Heading level={HeadingLevel.One}>Namada RPGF Drop</Heading>
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
          <Button variant={ButtonVariant.Contained}>Ethereum Wallet</Button>
          <Button variant={ButtonVariant.Contained}>
            Namada Trusted Setup
          </Button>
          <Button variant={ButtonVariant.Contained}>Cosmos Wallet</Button>
          <Button variant={ButtonVariant.Contained}>Osmosis Wallet</Button>
          <Button variant={ButtonVariant.Contained}>Stargate Wallet</Button>
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

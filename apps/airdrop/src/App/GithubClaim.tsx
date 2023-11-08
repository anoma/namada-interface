import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";
import {
  Claim,
  ClaimLabel,
  ClaimValue,
  EligibilityInfo,
} from "./App.components";
import { useEffect, useState } from "react";
import { ClaimResponse } from "./types";
import { useNavigate } from "react-router-dom";

type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  has_claimed: boolean;
};

const { REACT_APP_REDIRECT_URI: redirectUrl = "" } = process.env;

const claimWithGithub = async (
  access_token: string,
  airdrop_address: string
): Promise<ClaimResponse> => {
  const response = await fetch("http://localhost:5000/api/v1/airdrop/github", {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({ access_token, airdrop_address }),
  });

  return response.json();
};

const getClaimInfo = async (code: string): Promise<GithubClaim> => {
  const response = await fetch(
    `http://localhost:5000/api/v1/airdrop/github/${code}`,
    {
      method: "GET",
    }
  );
  const json = await response.json();

  return { ...json, claimed: false };
};

type Props = { namadaAddress: string };

export const GithubClaim: React.FC<Props> = ({ namadaAddress }: Props) => {
  const navigate = useNavigate();

  const [githubClaimInfo, setGithubClaimInfo] = useState<GithubClaim | null>(
    null
  );

  const url = window.location.href;
  const hasCode = url.includes("?code=");
  useEffect(() => {
    if (hasCode) {
      (async () => {
        const code = url.split("?code=")[1];
        const response = await getClaimInfo(code);
        setGithubClaimInfo(response);
        navigate("/", { replace: true });
      })();
    }
  }, []);

  return (
    <Claim>
      {!githubClaimInfo && (
        <Button
          variant={ButtonVariant.Contained}
          onClick={() =>
            window.open(
              `https://github.com/login/oauth/authorize?client_id=Iv1.dbd15f7e1b50c0d7&redirect_uri=${redirectUrl}`,
              "_self"
            )
          }
        >
          With GitHub
        </Button>
      )}

      {githubClaimInfo && (
        <>
          <Heading level={HeadingLevel.Three}>With github:</Heading>
          <EligibilityInfo>
            <ClaimLabel>Eligible: </ClaimLabel>
            <ClaimValue>{githubClaimInfo.eligible ? "Yes" : "No"}</ClaimValue>
            <ClaimLabel>Amount: </ClaimLabel>
            <ClaimValue>{githubClaimInfo.amount} NAM</ClaimValue>
          </EligibilityInfo>
        </>
      )}
      {namadaAddress &&
        githubClaimInfo &&
        githubClaimInfo.github_token &&
        !githubClaimInfo.has_claimed && (
          <Button
            variant={ButtonVariant.Contained}
            onClick={async () => {
              const response = await claimWithGithub(
                githubClaimInfo.github_token as string,
                namadaAddress
              );
              setGithubClaimInfo({
                ...githubClaimInfo,
                has_claimed: response.confirmed,
              });
            }}
          >
            Claim
          </Button>
        )}
      {githubClaimInfo?.has_claimed && <ClaimLabel>Claimed</ClaimLabel>}
    </Claim>
  );
};

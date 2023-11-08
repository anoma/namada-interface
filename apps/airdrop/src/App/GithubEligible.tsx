import { useAtom } from "jotai";
import { confirmationAtom, githubAtom } from "./state";
import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Input,
  InputVariants,
  Toggle,
} from "@namada/components";
import {
  AirdropAddress,
  Breadcrumb,
  ClaimsSection,
  EligibilitySection,
  ExtensionInfo,
  GithubBreadcrumb,
  GithubContainer,
  GithubFooter,
  GithubHeader,
  GithubSection,
  TOSToggle,
} from "./App.components";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useIntegrationConnection } from "@namada/hooks";
import { ClaimResponse } from "./types";

type Step = "eligibility" | "claim";

const { REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "namadaChainId" } =
  process.env;

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

export const GithubEligible: React.FC = () => {
  const [github] = useAtom(githubAtom);
  const [_confirmation, setConfirmation] = useAtom(confirmationAtom);
  const [step, setStep] = useState<Step>("eligibility");
  const [namadaAddress, setNamadaAddress] = useState<string>("");
  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const [namada, _, withNamadaConnection] =
    useIntegrationConnection(namadaChainId);

  const handleImportButton = async (): Promise<void> => {
    if (namadaAddress === "") {
      withNamadaConnection(async () => {
        const accounts = await namada?.accounts();
        if (accounts && accounts.length > 0) {
          const address = accounts[0].address;
          setNamadaAddress(address);
        }
      });
    } else {
      setNamadaAddress("");
    }
  };

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const navigate = useNavigate();
  return (
    <GithubContainer>
      <GithubHeader>
        <Button
          variant={ButtonVariant.Small}
          onClick={() => {
            navigate("/");
          }}
        >
          Start over
        </Button>
        <GithubBreadcrumb>
          <Breadcrumb className={step === "eligibility" ? "active" : ""}>
            1. Eligibility
          </Breadcrumb>
          <Breadcrumb className={step === "claim" ? "active" : ""}>
            2. Claim
          </Breadcrumb>
        </GithubBreadcrumb>
      </GithubHeader>
      <GithubSection>
        {step === "eligibility" && (
          <EligibilitySection>
            <span>
              <Heading level={HeadingLevel.One}>You are eligible</Heading>
              <p>Congrats, you are eligible for the Namada RPGF Drop!</p>
            </span>
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => {
                setStep("claim");
              }}
            >
              Claim NAM
            </Button>
          </EligibilitySection>
        )}

        {step === "claim" && (
          <ClaimsSection>
            <Heading level={HeadingLevel.One}>Claim NAM</Heading>
            <p>
              Submit your Namada public key to be included in the genesis
              proposal
            </p>
            <AirdropAddress>
              <Input
                variant={InputVariants.Text}
                value={namadaAddress}
                onChangeCallback={(e) => setNamadaAddress(e.target.value)}
                label="Namada airdrop address"
              />
              <Button
                variant={ButtonVariant.Small}
                onClick={handleImportButton}
              >
                {namadaAddress ? "Clear" : "Import"}
              </Button>
            </AirdropAddress>

            {/*TODO: Make this a component*/}
            <TOSToggle>
              <Toggle
                checked={isToggleChecked}
                onClick={() => setIsToggleChecked(!isToggleChecked)}
              />
              <span onClick={() => setIsToggleChecked(!isToggleChecked)}>
                By claiming NAM you agree to the Terms of Service and are not in
                the US or any other prohibited jurisdiction
              </span>
            </TOSToggle>

            <Button
              variant={ButtonVariant.Contained}
              onClick={async () => {
                if (!github.githubToken) {
                  throw new Error("Github token not found");
                }
                const res = await claimWithGithub(
                  github.githubToken,
                  namadaAddress
                );
                setConfirmation({
                  confirmed: res.confirmed,
                  address: res.airdrop_address || "",
                  amount: res.amount,
                });
                navigate("/airdrop-confirmed");
              }}
              disabled={namadaAddress === "" || !isToggleChecked}
            >
              Claim NAM
            </Button>

            <ExtensionInfo>
              <Heading level={HeadingLevel.Two}>
                {`Don't have a Namada address yet?`}{" "}
              </Heading>
              <p>
                {`Install the Namada browser extension or use the Namada CLI to
              create your NAM keys and add the public key to Namada's genesis
              block proposal using the "Claim NAM" button above.`}
              </p>
              <Button
                variant={ButtonVariant.Contained}
                // TODO: fix after  we publish extension
                onClick={() => handleDownloadExtension("https://namada.me")}
              >
                Install Namada Extension
              </Button>
              <ul>
                <li>Make sure you back up your seed phrase in a safe place</li>
                <li>
                  No one from Heliax, Anoma Foundation, or anyone else will be
                  able to recover your seed phrase if you lose it.
                </li>
                <li>
                  We will never ask you for your private key or seed phrase.
                </li>
              </ul>
            </ExtensionInfo>
          </ClaimsSection>
        )}
      </GithubSection>
      <GithubFooter></GithubFooter>
    </GithubContainer>
  );
};

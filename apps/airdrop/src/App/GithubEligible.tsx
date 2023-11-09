import { useAtom } from "jotai";
import {
  CommonState,
  GithubState,
  KeplrClaimType,
  KeplrState,
  TSState,
  confirmationAtom,
  githubAtom,
} from "./state";
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
  ClaimsSectionSignature,
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

const claimWithKeplr = async (
  type: KeplrClaimType,
  signer_address: string,
  signer_public_key: string,
  signer_public_key_type: string,
  signature: string,
  airdrop_address: string
): Promise<ClaimResponse> => {
  const response = await fetch(`http://localhost:5000/api/v1/airdrop/${type}`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      signer_address,
      signer_public_key,
      signer_public_key_type,
      signature,
      airdrop_address,
    }),
  });

  return response.json();
};

const claimWithTS = async (
  signer_public_key: string,
  signature: string,
  airdrop_address: string
): Promise<ClaimResponse> => {
  const response = await fetch(`http://localhost:5000/api/v1/airdrop/ts`, {
    method: "POST",
    headers: new Headers({ "content-type": "application/json" }),
    body: JSON.stringify({
      signer_public_key,
      signature,
      airdrop_address,
    }),
  });
  return response.json();
};

const claim = (
  state: CommonState,
  airdropAddress: string,
  tsSignature: string
): Promise<ClaimResponse> => {
  const { type } = state;
  if (type === "github") {
    const { githubToken } = state as GithubState;
    return claimWithGithub(githubToken, airdropAddress);
  } else if (type === "ts") {
    const { publicKey } = state as TSState;
    return claimWithTS(publicKey, tsSignature, airdropAddress);
  } else if (["cosmos", "osmosis", "stargate"].includes(type)) {
    const { signature, address } = state as KeplrState;
    return claimWithKeplr(
      type,
      address,
      signature.pubKey.value,
      signature.pubKey.type,
      signature.signature,
      airdropAddress
    );
  } else {
    throw new Error("Unsupported claim type");
  }
};

export const GithubEligible: React.FC = () => {
  const [github] = useAtom(githubAtom);
  const [_confirmation, setConfirmation] = useAtom(confirmationAtom);
  const [step, setStep] = useState<Step>("eligibility");
  const [airdropAddress, setNamadaAddress] = useState<string>("");
  const [tsSignature, setTsSignature] = useState<string>(
    "e0a261c82b6258af6242f963d3af8c1160c3f4bf21a737933e28aaf8bc8c9f4a09818aa992ea8014d26d5a48ccc1f549824a770ff351ed58e71c71b119ea960d"
  );
  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const [namada, _, withNamadaConnection] =
    useIntegrationConnection(namadaChainId);

  const handleImportButton = async (): Promise<void> => {
    if (airdropAddress === "") {
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
  const handleNonceButton = async (nonce: string): Promise<void> => {
    await navigator.clipboard.writeText(nonce);
  };

  const navigate = useNavigate();
  return (
    <GithubContainer>
      <GithubHeader>
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
            <ClaimsSectionSignature>
              <p>Generate a signature with your Trusted Setup keys</p>
              <p>Use this nonce in the CLI tool (Copy and paste this nonce)</p>

              {github && github.type === "ts" && (
                <>
                  <AirdropAddress>
                    {/*TODO: should be disabled*/}
                    <Input
                      variant={InputVariants.Text}
                      value={(github as TSState).nonce}
                      label="Nonce"
                      onChangeCallback={() => {}}
                    />
                    <Button
                      variant={ButtonVariant.Small}
                      onClick={() =>
                        handleNonceButton((github as TSState).nonce)
                      }
                    >
                      Copy
                    </Button>
                  </AirdropAddress>
                  <p>Paste the signature generated in the clipboard</p>

                  <Input
                    variant={InputVariants.Text}
                    value={tsSignature}
                    onChangeCallback={(e) => setTsSignature(e.target.value)}
                    label="Trusted setup signature"
                  />
                </>
              )}
            </ClaimsSectionSignature>
            <p>
              Submit your Namada public key to be included in the genesis
              proposal
            </p>
            <AirdropAddress>
              <Input
                variant={InputVariants.Text}
                value={airdropAddress}
                onChangeCallback={(e) => setNamadaAddress(e.target.value)}
                label="Namada airdrop address"
              />
              <Button
                variant={ButtonVariant.Small}
                onClick={handleImportButton}
              >
                {airdropAddress ? "Clear" : "Import"}
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
                if (!github) {
                  throw new Error("Github token not found");
                }
                const res = await claim(github, airdropAddress, tsSignature);

                setConfirmation({
                  confirmed: res.confirmed,
                  address: res.airdrop_address || "",
                  amount: res.amount,
                });
                navigate("/airdrop-confirmed");
              }}
              disabled={airdropAddress === "" || !isToggleChecked}
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

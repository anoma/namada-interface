import { useAtom } from "jotai";
import {
  CommonState,
  KeplrClaimType,
  TSState,
  confirmationAtom,
  claimAtom,
  ClaimResponse,
  KEPLR_CLAIMS,
  Signature,
} from "../state";
import {
  Button,
  ButtonVariant,
  Heading,
  Input,
  InputVariants,
  Toggle,
} from "@namada/components";
import {
  AirdropAddress,
  ClaimsSection,
  ClaimsSectionSignature,
  ExtensionInfo,
  TOSToggle,
} from "../App.components";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { AirdropResponse, airdropFetch, toast } from "App/utils";
import { DerivedAccount, WindowWithNamada } from "@namada/types";

const {
  AIRDROP_BACKEND_SERVICE_URL: backendUrl = "",
  REACT_APP_NAMADA_CHAIN_ID: namadaChainId = "",
} = process.env;

const claimWithGithub = async (
  access_token: string,
  airdrop_address: string,
  airdrop_public_key: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/github`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ access_token, airdrop_address, airdrop_public_key }),
  });
};

const claimWithKeplr = async (
  type: KeplrClaimType,
  signer_address: string,
  signer_public_key: string,
  signer_public_key_type: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string,
  message: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/${type}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_address,
      signer_public_key,
      signer_public_key_type,
      signature,
      airdrop_address,
      airdrop_public_key,
      message,
    }),
  });
};

const claimWithGitcoin = async (
  signer_address: string,
  message: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/gitcoin`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_address,
      message,
      signature,
      airdrop_address,
      airdrop_public_key,
    }),
  });
};

const claimWithTS = async (
  signer_public_key: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string,
  message: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/ts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      signer_public_key,
      signature,
      airdrop_address,
      airdrop_public_key,
      message,
    }),
  });
};

const claim = (
  state: CommonState,
  airdropAddress: string,
  airdropPubKey: string,
  tsSignature: string
): Promise<AirdropResponse<ClaimResponse>> => {
  const { type } = state;
  if (type === "github") {
    const { githubToken } = state;
    //TODO: as string
    return claimWithGithub(
      githubToken as string,
      airdropAddress,
      airdropPubKey
    );
  } else if (type === "ts") {
    const { publicKey, nonce } = state;
    return claimWithTS(
      publicKey,
      tsSignature,
      airdropAddress,
      airdropPubKey,
      nonce
    );
  } else if (type === "gitcoin") {
    const { signature, address, nonce } = state;
    return claimWithGitcoin(
      address,
      nonce,
      signature,
      airdropAddress,
      airdropPubKey
    );
  } else if (KEPLR_CLAIMS.includes(type)) {
    const { signature, address, nonce } = state;
    //TODO: as signature
    const sig = signature as Signature;
    return claimWithKeplr(
      type,
      address,
      sig.pubKey.value,
      sig.pubKey.type,
      sig.signature,
      airdropAddress,
      airdropPubKey,
      nonce
    );
  } else {
    throw new Error("Unsupported claim type");
  }
};

export const ClaimConfirmation: React.FC = () => {
  const namada = (window as WindowWithNamada)?.namada;
  const [claimState] = useAtom(claimAtom);
  const navigate = useNavigate();
  const [_confirmationState, setConfirmation] = useAtom(confirmationAtom);
  const [airdropAddress, setNamadaAddress] = useState<string>(
    localStorage.getItem("airdropAddress") || ""
  );
  const [airdropPubKey, setAirdropPubKey] = useState<string>(
    localStorage.getItem("airdropPubKey") || ""
  );
  const [tsSignature, setTsSignature] = useState<string>("");
  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const handleImport = useCallback(async (): Promise<
    DerivedAccount | undefined
  > => {
    try {
      await namada.connect(namadaChainId);
    } catch (e) {
      toast(`Something went wrong: ${e}`);
      return;
    }
    //Check if we have accounts - needed becasue defaultAccount returns nothing(swallows processing)
    const accounts = await namada.accounts(namadaChainId);
    if (accounts?.length === 0) {
      toast(`Please create an account in the Namada extension first.`);
      return;
    }

    return namada.defaultAccount(namadaChainId);
  }, [namada]);

  //TODO: reuse exisiting one
  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const handleNonceButton = async (nonce: string): Promise<void> => {
    await navigator.clipboard.writeText(nonce);
  };

  return (
    <ClaimsSection>
      <Heading level={"h1"}>Claim NAM</Heading>
      {claimState?.type === "ts" && (
        <ClaimsSectionSignature>
          <p>Generate a signature with your Trusted Setup keys</p>
          <p>Use this nonce in the CLI tool (Copy and paste this nonce)</p>

          <AirdropAddress>
            <Input
              variant={InputVariants.Text}
              value={(claimState as TSState).nonce}
              label="Nonce"
              onChange={() => {}}
            />
            <Button
              variant={ButtonVariant.Small}
              onClick={() => handleNonceButton((claimState as TSState).nonce)}
            >
              Copy
            </Button>
          </AirdropAddress>
          <p>Paste the signature generated in the clipboard</p>

          <Input
            variant={InputVariants.Text}
            value={tsSignature}
            onChange={(e) => setTsSignature(e.target.value)}
            label="Trusted setup signature"
          />
        </ClaimsSectionSignature>
      )}
      <p>
        Submit your Namada public key to be included in the genesis proposal
      </p>
      <AirdropAddress>
        <Input
          variant={InputVariants.Text}
          value={airdropPubKey}
          onChange={(e) => setAirdropPubKey(e.target.value)}
          label="Namada public key"
        />
        <Button
          disabled={!namada}
          tooltip={
            namada
              ? ""
              : "To import please install the Namada extension using the link below and try again."
          }
          variant={ButtonVariant.Small}
          onClick={async () => {
            if (!airdropPubKey) {
              const account = await handleImport();
              const publicKey = account?.publicKey || "";
              setAirdropPubKey(publicKey);
              localStorage.setItem("airdropPubKey", publicKey);
            } else {
              setAirdropPubKey("");
              localStorage.removeItem("airdropPubKey");
            }
          }}
        >
          {airdropPubKey ? "Clear" : "Import"}
        </Button>
      </AirdropAddress>
      <AirdropAddress>
        <Input
          variant={InputVariants.Text}
          value={airdropAddress}
          onChange={(e) => setNamadaAddress(e.target.value)}
          label="Namada airdrop address"
        />
        <Button
          disabled={!namada}
          tooltip={
            namada
              ? ""
              : "To import please install the Namada extension using the link below and try again."
          }
          variant={ButtonVariant.Small}
          onClick={async () => {
            if (!airdropAddress) {
              const account = await handleImport();
              const address = account?.address || "";
              setNamadaAddress(address);
              localStorage.setItem("airdropAddress", address);
            } else {
              setNamadaAddress("");
              localStorage.removeItem("airdropAddress");
            }
          }}
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
          By claiming NAM you agree to the Terms of Service and are not in the
          US or any other prohibited jurisdiction
        </span>
      </TOSToggle>

      <Button
        variant={ButtonVariant.Contained}
        onClick={async () => {
          if (!claimState) {
            throw new Error("Claim state is not set");
          }
          let response: AirdropResponse<ClaimResponse> | undefined;

          try {
            response = await claim(
              claimState,
              airdropAddress,
              airdropPubKey,
              tsSignature
            );
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

          setConfirmation({
            confirmed: result.confirmed,
            address: result.airdrop_address || "",
            amount: result.amount,
          });
          navigate("/airdrop-confirmed");
        }}
        disabled={airdropAddress === "" || !isToggleChecked}
      >
        Claim NAM
      </Button>

      <ExtensionInfo>
        <Heading level={"h2"} size={"2xl"}>
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
            No one from Heliax, Anoma Foundation, or anyone else will be able to
            recover your seed phrase if you lose it.
          </li>
          <li>We will never ask you for your private key or seed phrase.</li>
        </ul>
      </ExtensionInfo>
    </ClaimsSection>
  );
};

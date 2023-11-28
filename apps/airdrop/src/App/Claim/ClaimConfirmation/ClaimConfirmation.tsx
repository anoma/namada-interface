import {
  ActionButton,
  Button,
  ButtonVariant,
  Heading,
  Input,
  InputVariants,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount, WindowWithNamada } from "@namada/types";
import {
  AirdropResponse,
  airdropFetch,
  bech32mValidation,
  toast,
} from "App/utils";
import { useAtom } from "jotai";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ClaimsSectionSignature } from "../../App.components";

import {
  ClaimResponse,
  CommonState,
  KEPLR_CLAIMS,
  KeplrClaimType,
  KeplrSignature,
  TSState,
  claimAtom,
  confirmationAtom,
} from "../../state";

import { AcceptTermsCheckbox } from "App/Common/AcceptTermsCheckbox";
import { BigNuclearClaimButton } from "App/Common/BigNuclearClaimButton";
import {
  ButtonContainer,
  ClaimHeading,
  ClaimSectionContainer,
  ClaimsSection,
  InputActionButton,
  TermsContainer,
} from "./ClaimConfirmation.components";

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
      //TODO: as string
      signature as string,
      airdropAddress,
      airdropPubKey
    );
  } else if (KEPLR_CLAIMS.includes(type)) {
    const { signature, address, nonce } = state;
    //TODO: as signature
    const sig = signature as KeplrSignature;
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
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
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

  const airdropAddressValid = bech32mValidation("tnam", airdropAddress);
  const airdropPubKeyValid = bech32mValidation("tpknam", airdropPubKey);

  const importPublicKey = async (): Promise<void> => {
    if (!airdropPubKey) {
      const account = await handleImport();
      const publicKey = account?.publicKey || "";
      setAirdropPubKey(publicKey);
      localStorage.setItem("airdropPubKey", publicKey);
    } else {
      setAirdropPubKey("");
      localStorage.removeItem("airdropPubKey");
    }
  };

  const importAirdropAddress = async (): Promise<void> => {
    if (!airdropAddress) {
      const account = await handleImport();
      const address = account?.address || "";
      setNamadaAddress(address);
      localStorage.setItem("airdropAddress", address);
    } else {
      setNamadaAddress("");
      localStorage.removeItem("airdropAddress");
    }
  };

  const onClickClaim = async (): Promise<void> => {
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
      publicKey: result.airdrop_public_key || "",
      amount: result.amount,
    });
    navigate("/airdrop-confirmed");
  };

  const importButtonsTooltip = namada
    ? ""
    : "To import please install the Namada extension using the link below and try again.";

  return (
    <>
      <ClaimsSection>
        <ClaimHeading>
          <Heading
            level={"h1"}
            textAlign="left"
            size="5xl"
            themeColor="utility1"
          >
            Claim NAM
          </Heading>
        </ClaimHeading>
        <Stack gap={7}>
          {claimState?.type === "ts" && (
            <ClaimsSectionSignature>
              <Text>Generate a signature with yo ur Trusted Setup keys</Text>
              <Text>
                Use this nonce in the CLI tool (Copy and paste this nonce)
              </Text>
              <div>
                <Input
                  variant={InputVariants.Text}
                  value={(claimState as TSState).nonce}
                  label="Nonce"
                  hint={importButtonsTooltip}
                  onChange={() => {}}
                />
                <Button
                  variant={ButtonVariant.Small}
                  onClick={() =>
                    handleNonceButton((claimState as TSState).nonce)
                  }
                >
                  Copy
                </Button>
              </div>
              <p>Paste the signature generated in the clipboard</p>
              <Input
                variant={InputVariants.Text}
                value={tsSignature}
                hint={importButtonsTooltip}
                onChange={(e) => setTsSignature(e.target.value)}
                label="Trusted setup signature"
              />
            </ClaimsSectionSignature>
          )}

          <ClaimSectionContainer>
            <Stack gap={1}>
              <Text themeColor="primary" fontSize="xl">
                Submit your Namada public key to be included in the genesis
                proposal
              </Text>
              <Input
                theme={airdropPubKeyValid ? "secondary" : "primary"}
                variant={InputVariants.Text}
                value={airdropPubKey}
                error={airdropPubKey.length > 0 && !airdropPubKeyValid}
                onChange={(e) => setAirdropPubKey(e.target.value)}
                placeholder="Enter your Namada public key"
              >
                <InputActionButton>
                  <ActionButton
                    disabled={!namada}
                    size="sm"
                    variant="primary"
                    onClick={importPublicKey}
                  >
                    {airdropPubKey ? "Clear" : "Import from extension"}
                  </ActionButton>
                </InputActionButton>
              </Input>

              <Input
                variant={InputVariants.Text}
                value={airdropAddress}
                theme={airdropAddressValid ? "secondary" : "primary"}
                error={airdropAddress.length > 0 && !airdropAddressValid}
                onChange={(e) => setNamadaAddress(e.target.value)}
                placeholder="Enter your Namada transparent address"
              >
                <InputActionButton>
                  <ActionButton
                    disabled={!namada}
                    size="sm"
                    variant="primary"
                    onClick={importAirdropAddress}
                  >
                    {airdropAddress ? "Clear" : "Import from extension"}
                  </ActionButton>
                </InputActionButton>
              </Input>
            </Stack>

            <TermsContainer>
              <AcceptTermsCheckbox
                checked={isToggleChecked}
                onChange={() => setIsToggleChecked(!isToggleChecked)}
              />
            </TermsContainer>
          </ClaimSectionContainer>
        </Stack>
      </ClaimsSection>
      <ButtonContainer>
        <BigNuclearClaimButton
          valid={Boolean(
            airdropAddressValid && airdropPubKey && isToggleChecked
          )}
          onClick={onClickClaim}
        />
      </ButtonContainer>
    </>
  );
};

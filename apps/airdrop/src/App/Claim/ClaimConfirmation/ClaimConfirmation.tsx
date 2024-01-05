import { ActionButton, Heading, Input, Stack, Text } from "@namada/components";
import { DerivedAccount, WindowWithNamada } from "@namada/types";
import { AirdropResponse, ToastMessage, toast } from "App/utils";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ClaimsSectionSignature } from "../../App.components";

import {
  CommonState,
  KEPLR_CLAIMS,
  KeplrSignature,
  TSState,
  claimAtom,
  confirmationAtom,
} from "../../state";

import { bech32mValidation } from "@namada/utils";
import { AcceptTermsCheckbox } from "App/Common/AcceptTermsCheckbox";
import { BigNuclearClaimButton } from "App/Common/BigNuclearClaimButton";
import { StepIndicator } from "App/Common/StepIndicator";
import {
  claimWithGitcoin,
  claimWithGithub,
  claimWithKeplr,
  claimWithTrustedSetup,
} from "App/claimService";
import { ClaimResponse } from "App/types";
import gsap from "gsap";
import {
  ButtonContainer,
  ClaimBadge,
  ClaimHeading,
  ClaimInputWrapper,
  ClaimSectionContainer,
  ClaimsSection,
  InputActionButton,
  NonceContainer,
  PasteSignatureContainer,
  StepHeader,
  TermsContainer,
} from "./ClaimConfirmation.components";

const { NAMADA_INTERFACE_NAMADA_CHAIN_ID: namadaChainId = "" } = process.env;

const claim = (
  state: CommonState,
  airdropAddress: string,
  airdropPubKey: string,
  tsSignature: string
): Promise<AirdropResponse<ClaimResponse>> => {
  const { type } = state;
  if (type === "github") {
    const { githubToken } = state;
    return claimWithGithub(
      githubToken as string,
      airdropAddress,
      airdropPubKey
    );
  } else if (type === "ts") {
    const { publicKey, nonce } = state;
    return claimWithTrustedSetup(
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
      signature as string,
      airdropAddress,
      airdropPubKey
    );
  } else if (KEPLR_CLAIMS.includes(type)) {
    const { signature, address, nonce } = state;
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
  const [airdropAddress, setAirdropAddress] = useState<string>(
    localStorage.getItem("airdropAddress") || ""
  );
  const [airdropPubKey, setAirdropPubKey] = useState<string>(
    localStorage.getItem("airdropPubKey") || ""
  );
  const [tsSignature, setTsSignature] = useState<string>("");
  const [isToggleChecked, setIsToggleChecked] = useState(false);

  const isTrustedSetup = claimState?.type === "ts";
  const airdropAddressValid = bech32mValidation("tnam", airdropAddress);
  const airdropPubKeyValid = bech32mValidation("tpknam", airdropPubKey);

  const isTopFormValid = Boolean(!isTrustedSetup || tsSignature);
  const isBottomFormValid = Boolean(
    airdropAddressValid && airdropPubKeyValid && isToggleChecked
  );
  const isValidForm = Boolean(isTopFormValid && isBottomFormValid);

  const handleImport = useCallback(async (): Promise<
    DerivedAccount | undefined
  > => {
    try {
      await namada.connect(namadaChainId);
    } catch (e) {
      toast(ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(e));
      return;
    }
    //Check if we have accounts - needed because defaultAccount returns nothing(swallows processing)
    const accounts = await namada.accounts(namadaChainId);
    if (accounts?.length === 0) {
      toast(`Please create an account in the Namada extension first.`);
      return;
    }

    return namada.defaultAccount(namadaChainId);
  }, [namada]);

  useEffect(() => {
    if (isValidForm) {
      gsap.to(window, { duration: 0.25, scrollTo: 0 });
    }
  }, [isValidForm]);

  if (airdropAddressValid) {
    localStorage.setItem("airdropAddress", airdropAddress);
  } else if (airdropAddress === "") {
    localStorage.removeItem("airdropAddress");
  }

  if (airdropPubKey) {
    localStorage.setItem("airdropPubKey", airdropPubKey);
  } else if (airdropPubKey === "") {
    localStorage.removeItem("airdropPubKey");
  }

  const importPublicKey = async (): Promise<void> => {
    if (!airdropPubKey) {
      const account = await handleImport();
      const publicKey = account?.publicKey || "";
      setAirdropPubKey(publicKey);
    } else {
      setAirdropPubKey("");
    }
  };

  const importAirdropAddress = async (): Promise<void> => {
    if (!airdropAddress) {
      const account = await handleImport();
      const address = account?.address || "";
      setAirdropAddress(address);
    } else {
      setAirdropAddress("");
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
      toast(ToastMessage.SOMETHING_WENT_WRONG);
      return;
    } else if (!response.ok) {
      // Backup for unexpected extensions pretending to be metamask
      if (
        response.error.message.includes("signature") &&
        claimState.type === "gitcoin"
      ) {
        toast(
          ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(
            "Invalid signature. Please make sure you are using the Metamask extension."
          )
        );
        return;
      } else {
        toast(
          ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(response.error.message)
        );
        return;
      }
    }
    const { value: result } = response;

    setConfirmation({
      confirmed: result.confirmed,
      address: result.airdrop_address || "",
      publicKey: result.airdrop_public_key || "",
      amount: ["cosmos", "osmosis"].includes(claimState.type)
        ? 15
        : result.amount,
    });
    navigate("/claim-confirmed");
  };

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
            <Stack
              gap={4}
              direction="horizontal"
              style={{ alignItems: "center" }}
            >
              Claim NAM
              {isTrustedSetup && <ClaimBadge>Trusted Setup</ClaimBadge>}
            </Stack>
          </Heading>
        </ClaimHeading>
        <ButtonContainer>
          <BigNuclearClaimButton valid={isValidForm} onClick={onClickClaim} />
        </ButtonContainer>
        <Stack gap={7}>
          {isTrustedSetup && (
            <ClaimSectionContainer active={true}>
              <ClaimsSectionSignature>
                <Stack gap={5}>
                  <div>
                    <StepHeader>
                      <Text themeColor="primary" fontSize="xl">
                        <StepIndicator>1</StepIndicator>
                        Generate a signature with your Trusted Setup keys
                      </Text>
                    </StepHeader>
                  </div>
                  <NonceContainer title={(claimState as TSState).nonce}>
                    <Input
                      theme="primary"
                      variant="ReadOnlyCopy"
                      value={(claimState as TSState).nonce}
                      label="Use this nonce in the CLI tool (Copy and paste this nonce)"
                      onChange={() => {}}
                    />
                  </NonceContainer>
                  <PasteSignatureContainer title={tsSignature}>
                    <Input
                      theme="primary"
                      value={tsSignature}
                      onChange={(e) => setTsSignature(e.target.value)}
                      label="Paste the signature generated in the CLI"
                      placeholder="Enter the signature generated in your CLI"
                    />
                  </PasteSignatureContainer>
                </Stack>
              </ClaimsSectionSignature>
            </ClaimSectionContainer>
          )}

          <ClaimSectionContainer active={isTopFormValid}>
            <Stack gap={6}>
              <Text themeColor="primary" fontSize="xl">
                {isTrustedSetup && <StepIndicator>2</StepIndicator>}
                Submit your Namada public key to be included in the genesis
                block proposal
              </Text>
              <Stack gap={4}>
                <ClaimInputWrapper title={airdropPubKey}>
                  <Input
                    theme={airdropPubKeyValid ? "secondary" : "primary"}
                    value={airdropPubKey}
                    error={
                      airdropPubKey.length > 0 && !airdropPubKeyValid
                        ? "Invalid public key. Make sure you're providing a Namada public key starting with the `tpknam1` prefix."
                        : ""
                    }
                    onChange={(e) => {
                      const { value: publicKey } = e.target;
                      setAirdropPubKey(publicKey);
                    }}
                    label="Namada public key"
                    placeholder="Enter your Namada public key (tpknam1…)"
                  >
                    <InputActionButton
                      title={
                        !namada && !airdropPubKey
                          ? "Please install the Namada extension and hard refresh the website"
                          : ""
                      }
                    >
                      <ActionButton
                        disabled={!namada && !airdropPubKey}
                        size="sm"
                        variant="primary"
                        hoverColor="secondary"
                        onClick={importPublicKey}
                      >
                        {airdropPubKey ? "Clear" : "Import from extension"}
                      </ActionButton>
                    </InputActionButton>
                  </Input>
                </ClaimInputWrapper>
                <ClaimInputWrapper title={airdropAddress}>
                  <Input
                    value={airdropAddress}
                    theme={airdropAddressValid ? "secondary" : "primary"}
                    label="Namada transparent address"
                    placeholder="Enter your Namada transparent address (tnam1…)"
                    error={
                      airdropAddress.length > 0 && !airdropAddressValid
                        ? "Invalid transparent address. Make sure you're providing an address starting with the 'tnam1' prefix."
                        : ""
                    }
                    onChange={(e) => {
                      const { value: airdropAddress } = e.target;
                      setAirdropAddress(airdropAddress);
                    }}
                  >
                    <InputActionButton
                      title={
                        !namada && !airdropAddress
                          ? "Please install the Namada extension and hard refresh the website"
                          : ""
                      }
                    >
                      <ActionButton
                        disabled={!namada && !airdropAddress}
                        size="sm"
                        variant="primary"
                        hoverColor="secondary"
                        onClick={importAirdropAddress}
                      >
                        {airdropAddress ? "Clear" : "Import from extension"}
                      </ActionButton>
                    </InputActionButton>
                  </Input>
                </ClaimInputWrapper>
              </Stack>
            </Stack>
            <TermsContainer>
              <AcceptTermsCheckbox
                disabled={!airdropAddressValid || !airdropPubKeyValid}
                fullVersion={true}
                checked={isToggleChecked}
                onChange={() => setIsToggleChecked(!isToggleChecked)}
              />
            </TermsContainer>
          </ClaimSectionContainer>
        </Stack>
      </ClaimsSection>

      {/* <Transition className="page-transition" /> */}
    </>
  );
};

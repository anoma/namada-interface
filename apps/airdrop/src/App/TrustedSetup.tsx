import { ActionButton, Heading, Input, Stack, Text } from "@namada/components";
import { useAtom } from "jotai";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckEligibilityButton,
  CheckEligibilityContainer,
  EligibilityHeader,
  EligibilitySectionWrapper,
  TrustedSetupHeader,
  TrustedSetupInputWrapper,
  TrustedSetupList,
  TrustedSetupListItem,
} from "./App.components";
import { BreadcrumbStatus } from "./Common/BreadcrumbStatus";
import { StepIndicator } from "./Common/StepIndicator";
import { SidebarPage } from "./Layouts/SidebarPage";
import { checkTrustedSetupClaim } from "./claimService";
import { claimAtom, confirmationAtom } from "./state";
import { TSClaim } from "./types";
import {
  AirdropResponse,
  ToastMessage,
  navigatePostCheck,
  toast,
} from "./utils";

export const TrustedSetup: React.FC = () => {
  const navigate = useNavigate();
  const [publicKey, setPublicKey] = useState("");

  const [_claim, setClaimState] = useAtom(claimAtom);
  const [_conf, setConfirmation] = useAtom(confirmationAtom);

  const onCheckEligibility = async (): Promise<void> => {
    let response: AirdropResponse<TSClaim> | undefined;

    try {
      response = await checkTrustedSetupClaim(publicKey);
    } catch (e) {
      console.error(e);
    }

    if (!response) {
      toast(ToastMessage.SOMETHING_WENT_WRONG);
      return;
    } else if (!response.ok) {
      toast(ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(response.error.message));
      return;
    }
    const { value: result } = response;

    if (result.eligible && result.has_claimed) {
      setConfirmation({
        confirmed: true,
        address: result.airdrop_address as string,
        publicKey: result.airdrop_public_key as string,
        amount: result.amount,
      });
    }

    setClaimState({
      eligible: result.eligible,
      amount: result.amount,
      hasClaimed: result.has_claimed,
      type: "ts",
      nonce: result.nonce,
      publicKey,
    });

    navigatePostCheck(navigate, result.eligible, result.has_claimed);
  };

  return (
    <SidebarPage>
      <EligibilityHeader>
        <Stack gap={6} direction="horizontal">
          <BreadcrumbStatus active={true} accepted={false}>
            Eligibility
          </BreadcrumbStatus>
          <BreadcrumbStatus active={false}>Claim</BreadcrumbStatus>
        </Stack>
      </EligibilityHeader>
      <EligibilitySectionWrapper>
        <Stack gap={12}>
          <Stack gap={3}>
            <TrustedSetupHeader>
              <Heading
                level={"h1"}
                size="5xl"
                themeColor="primary"
                textAlign="left"
              >
                Check Eligibility for Trusted Setup Participants
              </Heading>
              <Text themeColor="primary">
                If you contributed to the Namada Trusted Setup, you can use this
                tool to prove your contribution and check eligibility.
              </Text>
            </TrustedSetupHeader>
          </Stack>
          <TrustedSetupList>
            <TrustedSetupListItem>
              <StepIndicator>1</StepIndicator>
              Get the CLI tool from{" "}
              <a
                href="https://github.com/anoma/namada-trusted-setup-claimer"
                target="_blank"
                rel="nofollow noreferrer"
              >
                https://github.com/anoma/namada-trusted-setup-claimer
              </a>
            </TrustedSetupListItem>
            <TrustedSetupListItem>
              <StepIndicator>2</StepIndicator>
              Follow the steps in the <b>README</b> of the repository
            </TrustedSetupListItem>
            <TrustedSetupListItem>
              <StepIndicator>3</StepIndicator>
              Paste the Public Key derived from the seed phrase you created when
              you participated in Namada&apos;s Trusted Setup
              <CheckEligibilityContainer>
                <TrustedSetupInputWrapper title={publicKey}>
                  <Input
                    value={publicKey}
                    theme="primary"
                    placeholder="Enter your public key"
                    onChange={(e) => setPublicKey(e.target.value)}
                  >
                    <CheckEligibilityButton>
                      <ActionButton
                        variant="primary"
                        size="sm"
                        disabled={!publicKey}
                        onClick={onCheckEligibility}
                      >
                        Check Eligibility
                      </ActionButton>
                    </CheckEligibilityButton>
                  </Input>
                </TrustedSetupInputWrapper>
              </CheckEligibilityContainer>
            </TrustedSetupListItem>
          </TrustedSetupList>
        </Stack>
      </EligibilitySectionWrapper>
    </SidebarPage>
  );
};

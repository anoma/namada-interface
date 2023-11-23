import {
  Button,
  ButtonVariant,
  Heading,
  Input,
  InputVariants,
} from "@namada/components";
import { TSEligibilityContainer } from "./App.components";
import { useState } from "react";
import { useAtom } from "jotai";
import { confirmationAtom, claimAtom } from "./state";
import { useNavigate } from "react-router-dom";
import {
  AirdropResponse,
  airdropFetch,
  navigatePostCheck,
  toast,
} from "./utils";

type TSClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  nonce: string;
};

const { AIRDROP_BACKEND_SERVICE_URL: backendUrl = "" } = process.env;

const checkClaim = async (
  publicKey: string
): Promise<AirdropResponse<TSClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/ts/${publicKey}`, {
    method: "GET",
  });
};

export const TrustedSetup: React.FC = () => {
  const navigate = useNavigate();
  const [publicKey, setPublicKey] = useState("");

  const [_claim, setClaimState] = useAtom(claimAtom);
  const [_conf, setConfirmation] = useAtom(confirmationAtom);

  return (
    <TSEligibilityContainer>
      <Heading level={"h1"}>
        Check Eligibility for Trusted Setup Participants
      </Heading>
      <p>
        If you contributed to the Namada Trusted Setup, you can use this tool to
        <br />
        prove your contribution and check eligibility.
      </p>
      <ol>
        <li>
          Get the CLI tool from{" "}
          <a href="https://github.com/anoma/namada-trusted-setup-signer">
            https://github.com/anoma/namada-trusted-setup-signer
          </a>
        </li>
        <li>
          Follow the steps in the <b>README</b> of the repository
        </li>
        <li>Paste the Public Key from your Trusted Setup Participation</li>
      </ol>

      <Input
        variant={InputVariants.Text}
        value={publicKey}
        onChange={(e) => setPublicKey(e.target.value)}
        label="Trusted Setup Public Key"
      />

      <Button
        variant={ButtonVariant.Contained}
        onClick={async () => {
          let response: AirdropResponse<TSClaim> | undefined;

          try {
            response = await checkClaim(publicKey);
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

          if (result.eligible && result.has_claimed) {
            setConfirmation({
              confirmed: true,
              address: result.airdrop_address as string,
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
        }}
      >
        Check Eligibility
      </Button>
    </TSEligibilityContainer>
  );
};

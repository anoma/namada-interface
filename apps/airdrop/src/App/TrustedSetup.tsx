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
import { airdropFetch, navigatePostCheck } from "./utils";

type TSClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  nonce: string;
};

const { AIRDROP_BACKEND_SERVICE_URL: backendUrl = "" } = process.env;

const checkClaim = async (publicKey: string): Promise<TSClaim> => {
  const response = await airdropFetch(
    `${backendUrl}/api/v1/airdrop/ts/${publicKey}`,
    {
      method: "GET",
    }
  );
  return response.json();
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
          const response = await checkClaim(publicKey);
          if (response.eligible && !response.has_claimed) {
            setClaimState({
              eligible: response.eligible,
              amount: response.amount,
              hasClaimed: response.has_claimed,
              type: "ts",
              nonce: response.nonce,
              publicKey,
            });
          } else if (response.eligible && response.has_claimed) {
            setConfirmation({
              confirmed: true,
              address: response.airdrop_address as string,
              amount: response.amount,
            });
          }
          navigatePostCheck(navigate, response.eligible, response.has_claimed);
        }}
      >
        Check Eligibility
      </Button>
    </TSEligibilityContainer>
  );
};

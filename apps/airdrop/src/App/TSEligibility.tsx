import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Input,
  InputVariants,
} from "@namada/components";
import { TSEligibilityContainer } from "./App.components";
import { useState } from "react";
import { useAtom } from "jotai";
import { githubAtom } from "./state";
import { useNavigate } from "react-router-dom";
import { navigatePostCheck } from "./Main";

type TSClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  nonce: string;
};

const checkClaim = async (publicKey: string): Promise<TSClaim> => {
  const response = await fetch(
    `http://localhost:5000/api/v1/airdrop/ts/${publicKey}`,
    {
      method: "GET",
    }
  );
  return response.json();
};

export const TSEligibility: React.FC = () => {
  const navigate = useNavigate();
  //TODO: remove later
  const [publicKey, setPublicKey] = useState(
    "47c873cc46fa202996e2a2084aa67c9f7bd03bb149c37c51398579050573cebf"
  );

  const [_, setClaimState] = useAtom(githubAtom);

  return (
    <TSEligibilityContainer>
      <Heading level={HeadingLevel.One}>
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
        onChangeCallback={(e) => setPublicKey(e.target.value)}
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
              nonce:
                "atest1d9khqw36gsmrzsfn8quyy33exumrgdp3ggcy2v2zx9rygwfjgyc5zd3ng3qnz33sgcursvzyuqv2mh" ||
                response.nonce,
              publicKey,
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

import { useNavigate } from "react-router-dom";
import { Button, ButtonVariant, Heading, Stack } from "@namada/components";
import { EligibilitySection } from "App/App.components";
import { useAtom } from "jotai";
import {
  GitcoinState,
  GithubState,
  KEPLR_CLAIMS,
  KeplrState,
  TSState,
  claimAtom,
} from "../state";

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
  if (!claimState) return null;

  return (
    <EligibilitySection>
      <span>
        <Heading level={"h1"}>You are eligible</Heading>
        <p>Congrats, you are eligible for the Namada RPGF Drop!</p>
      </span>
      <Stack gap={2}>
        {claimState.type === "ts" && (
          <span>
            <b>Public Key:</b> {(claimState as TSState).publicKey}
          </span>
        )}
        {claimState.type === "gitcoin" && (
          <span>
            <b>Wallet address:</b> {(claimState as GitcoinState).address}
          </span>
        )}
        {claimState.type === "github" && (
          <span>
            <b>Github Username</b> {(claimState as GithubState).githubUsername}
          </span>
        )}
        {(KEPLR_CLAIMS as readonly string[]).includes(claimState.type) && (
          <span>
            <b>Wallet address:</b> {(claimState as KeplrState).address}
          </span>
        )}

        <Button
          variant={ButtonVariant.Contained}
          onClick={() => {
            navigate("/claim/confirmation");
          }}
        >
          Claim NAM
        </Button>
      </Stack>
    </EligibilitySection>
  );
};

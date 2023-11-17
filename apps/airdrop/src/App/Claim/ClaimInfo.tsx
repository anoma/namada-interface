import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonVariant,
  Heading,
  Stack,
  Text,
} from "@namada/components";
import { EligibilitySection } from "App/App.components";
import { useAtom } from "jotai";
import {
  CommonState,
  GithubState,
  KEPLR_CLAIMS,
  Label,
  claimAtom,
  labelAtom,
} from "../state";
import {
  ZKPCryptographyPrivacyPreserving,
  interchainPGAndEarlyShieldedEcosystem,
  zCashRDRust,
} from "App/eligibilityMap";

//TODO: cleanup this whole component
const eligibleFor = (state: CommonState): string[] => {
  const { type } = state;

  if (type === "ts") {
    return ["ts"];
  } else if (type === "gitcoin") {
    return ["gitcoin"];
  } else if ((KEPLR_CLAIMS as readonly string[]).includes(type)) {
    return ["early-shielded-community"];
  } else if (type === "github") {
    const eligibilities = (state as GithubState).eligibilities;
    return eligibilities
      .map((eligibility) => {
        const el = eligibility.toLowerCase();

        return interchainPGAndEarlyShieldedEcosystem.has(el)
          ? "interchain"
          : ZKPCryptographyPrivacyPreserving.has(el)
          ? "zkp"
          : zCashRDRust.has(el)
          ? "zcash-rd-rust"
          : "";
      })
      .filter((eligibility) => eligibility !== "");
  } else {
    throw new Error("Invalid claim type");
  }
};

const EligibleText = ({
  selected,
  children,
}: {
  selected: boolean;
  children: React.ReactNode;
}): JSX.Element => {
  return <Text>{selected ? <b>{children} ✓</b> : children}</Text>;
};

const labelTextMap: Record<Label["type"], string> = {
  address: "Wallet address",
  publicKey: "Public key",
  username: "Github username",
  unknown: "",
};

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
  const [label] = useAtom(labelAtom);
  if (!claimState) return null;
  const eligibilities = new Set(eligibleFor(claimState));

  return (
    <Stack gap={4}>
      <EligibilitySection>
        <span>
          <Heading level={"h1"}>You are eligible</Heading>
          <p>Congrats, you are eligible for the Namada RPGF Drop!</p>
        </span>
        <Stack gap={2}>
          {label && (
            <span>
              <b>{labelTextMap[label.type]}</b> {label.value}
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
      <Heading level={"h2"}>Eligibility criteria</Heading>
      <EligibleText selected={eligibilities.has("zcash-rd-rust")}>
        Zcash R&D & Rust Developer Ecosystem
      </EligibleText>
      <EligibleText selected={eligibilities.has("zkp")}>
        ZKPs, Cryptography PGs, Privacy Research & Learning
      </EligibleText>
      <EligibleText selected={eligibilities.has("interchain")}>
        Interchain PGs & Early Shielded Ecosystem
      </EligibleText>
      <EligibleText selected={eligibilities.has("early-shielded-community")}>
        Early Shielded Community
      </EligibleText>
      <EligibleText selected={eligibilities.has("gitcoin")}>
        Gitcoin Donors of Privacy, ZK tech, and Crypto Advocacy
      </EligibleText>
      <EligibleText selected={eligibilities.has("ts")}>
        Namada Trusted Setup Participants
      </EligibleText>
    </Stack>
  );
};

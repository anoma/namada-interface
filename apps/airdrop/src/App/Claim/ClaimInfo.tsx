import { Stack } from "@namada/components";
import { EligibilitySection } from "App/App.components";
import { EligibilityCriteria } from "App/Common/EligibilityCriteria";
import { YouAreEligible } from "App/Common/YouAreEligible";
import {
  ZKPCryptographyPrivacyPreserving,
  interchainPGAndEarlyShieldedEcosystem,
  zCashRDRust,
} from "App/eligibilityMap";
import { labelTextMap } from "App/utils";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  CommonState,
  GithubState,
  KEPLR_CLAIMS,
  claimAtom,
  labelAtom,
} from "../state";

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

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
  const [label] = useAtom(labelAtom);
  if (!claimState) return null;
  const eligibilities = new Set(eligibleFor(claimState));

  return (
    <Stack gap={6}>
      <EligibilitySection>
        <YouAreEligible
          title={label ? labelTextMap[label.type] : ""}
          accountOrWallet={label ? label.value : ""}
          onClaim={() => navigate("/claim/confirmation")}
        />
      </EligibilitySection>
      <EligibilityCriteria eligibilities={eligibilities} />
    </Stack>
  );
};

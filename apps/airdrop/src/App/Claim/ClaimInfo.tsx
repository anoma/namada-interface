import { Stack } from "@namada/components";
import { EligibilitySection } from "App/App.components";
import { EligibilityCriteria } from "App/Common/EligibilityCriteria";
import { YouAreEligible } from "App/Common/YouAreEligible";
import { mapEligibility } from "App/eligibilityMap";
import { labelTextMap, toast } from "App/utils";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { CommonState, KEPLR_CLAIMS, claimAtom, labelAtom } from "../state";

const eligibleFor = (state: CommonState): string[] => {
  const { type } = state;

  if (type === "ts") {
    return ["ts"];
  } else if (type === "gitcoin") {
    return ["gitcoin"];
  } else if ((KEPLR_CLAIMS as readonly string[]).includes(type)) {
    return ["early-shielded-community"];
  } else if (type === "github") {
    const eligibilities = state.eligibilities;
    return eligibilities
      .map((e) => mapEligibility(e))
      .filter((eligibility) => eligibility !== "");
  } else {
    throw new Error("Invalid claim type");
  }
};

export const ClaimInfo: React.FC = () => {
  const navigate = useNavigate();
  const [claimState] = useAtom(claimAtom);
  const [label] = useAtom(labelAtom);

  if (!claimState) {
    toast("Claim state is empty!");
    return null;
  }
  const eligibilities = new Set(eligibleFor(claimState));

  return (
    <Stack gap={8}>
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

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSanitizedParams } from "@namada/hooks";
import GovernanceRoutes from "App/Governance/routes";

const parseProposalId = (asString: string | undefined): bigint | null => {
  if (typeof asString === "undefined") {
    return null;
  }

  try {
    const asBigInt = BigInt(asString);
    return asBigInt;
  } catch (e) {
    return null;
  }
};

export const useProposalIdParam = (): bigint | null => {
  const { proposalId: proposalIdString } = useSanitizedParams();
  const navigate = useNavigate();

  const proposalId = parseProposalId(proposalIdString);

  useEffect(() => {
    if (proposalId === null) {
      navigate(GovernanceRoutes.overview().url);
    }
  }, [proposalId]);

  return proposalId;
};

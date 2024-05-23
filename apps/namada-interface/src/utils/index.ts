import { ProposalStatus, ProposalTypeString } from "@namada/types";

export const showProposalStatus = (status: ProposalStatus): string => {
  const statusText: Record<ProposalStatus, string> = {
    pending: "Upcoming",
    ongoing: "Ongoing",
    passed: "Passed",
    rejected: "Rejected",
  };

  return statusText[status];
};

export const showProposalTypeString = (type: ProposalTypeString): string => {
  const typeText: Record<ProposalTypeString, string> = {
    default: "Default",
    pgf_steward: "PGF Steward",
    pgf_payment: "PGF Payment",
  };

  return typeText[type];
};

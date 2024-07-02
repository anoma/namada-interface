import { ProposalStatus, ProposalTypeString } from "@namada/types";
import { EventData, TransactionEvent } from "types/events";

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
    default_with_wasm: "Default with Wasm",
    pgf_steward: "PGF Steward",
    pgf_payment: "PGF Payment",
  };

  return typeText[type];
};

export const showEpoch = (epoch: bigint): string => `Epoch ${epoch.toString()}`;

export const showProposalId = (proposalId: bigint): string =>
  `#${proposalId.toString()}`;

export const addTransactionEvent = <T>(
  handle: TransactionEvent,
  callback: (e: EventData<T>) => void
): void => {
  window.addEventListener(handle, callback as EventListener, false);
};

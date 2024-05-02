import { VoteType } from "slices/proposals";

export const colors: Record<VoteType, string> = {
  yes: "#15DD89",
  no: "#DD1599",
  veto: "#FF8A00",
  abstain: "#8a8a8a",
};

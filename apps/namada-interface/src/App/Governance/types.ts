export const voteTypes = ["yes", "no", "veto", "abstain"];
export type VoteType = (typeof voteTypes)[number];

export const colors: Record<VoteType, string> = {
  yes: "#15DD89",
  no: "#DD1599",
  veto: "#FF8A00",
  abstain: "#686868",
};

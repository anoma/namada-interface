// TODO: don't duplicate this with Staking
type RouteOutput = {
  url: string;
  toString: () => string;
};

export const routeOutput = (route: string): RouteOutput => ({
  url: `${index()}${route}`,
  toString: () => route,
});

export const index = (): string => `/governance`;

export const overview = (): RouteOutput => routeOutput(`/overview`);

export const proposal = (proposalId?: bigint): RouteOutput =>
  routeOutput(`/proposal/${proposalIdString(proposalId)}`);

export const submitVote = (proposalId?: bigint): RouteOutput =>
  routeOutput(`/submit-vote/${proposalIdString(proposalId)}`);

export const viewJson = (proposalId?: bigint): RouteOutput =>
  routeOutput(`/json/${proposalIdString(proposalId)}`);

const proposalIdString = (proposalId?: bigint): string =>
  typeof proposalId === "undefined" ? ":proposalId" : proposalId.toString();

export default {
  index,
  overview,
  proposal,
  submitVote,
  viewJson,
};

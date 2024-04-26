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

export const proposal = (proposalId: string = ":proposalId"): RouteOutput =>
  routeOutput(`/proposal/${proposalId}`);

export default {
  index,
  overview,
  proposal,
};

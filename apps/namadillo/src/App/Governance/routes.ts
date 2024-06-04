import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/governance`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput(`/`);

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

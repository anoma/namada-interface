import { RouteOutput, createRouteOutput } from "utils/routes";

export const index = (): string => `/staking`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput(`/`);

export const incrementBonding = (): RouteOutput =>
  routeOutput("/bonding/increment");

export const redelegateBonding = (): RouteOutput =>
  routeOutput("/bonding/redelegate");

export const unstake = (): RouteOutput => routeOutput("/bonding/unstake");

export const claimRewards = (): RouteOutput => routeOutput("/claim-rewards");

export const StakingRoutes = {
  index,
  overview,
  incrementBonding,
  redelegateBonding,
  claimRewards,
  unstake,
};

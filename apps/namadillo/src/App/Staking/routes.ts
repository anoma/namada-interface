import { RouteOutput, createRouteOutput } from "utils/routes";

export const index = (): string => `/staking`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput(`/`);

export const manage = (): RouteOutput => routeOutput("/manage");

export const incrementBonding = (): RouteOutput =>
  routeOutput("/bonding/increment");

export const redelegateBonding = (): RouteOutput =>
  routeOutput("/bonding/redelegate");

export const claimRewards = (): RouteOutput => routeOutput("/claim-rewards");

export const validatorDetails = (id: string | number): RouteOutput =>
  routeOutput(`/validator-details/${id}`);

export const validatorDetailsOwner = (
  validatorId: string | number,
  ownerId: string | number
): RouteOutput => routeOutput(`${validatorDetails(validatorId)}/${ownerId}`);

export const unstake = (): RouteOutput => routeOutput("/bonding/unstake");

export default {
  index,
  manage,
  overview,
  validatorDetails,
  validatorDetailsOwner,
  incrementBonding,
  redelegateBonding,
  claimRewards,
  unstake,
};

import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/transfer`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput("/");

export const namTransfer = (): RouteOutput => routeOutput("/nam");

export const shield = (): RouteOutput => routeOutput("/shield");

export const shieldAll = (): RouteOutput => routeOutput(`/shield-all`);

export const ibcTransfer = (): RouteOutput => routeOutput(`/ibc`);

export default {
  index,
  overview,
  namTransfer,
  shield,
  shieldAll,
  ibcTransfer,
};

import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/ibc`;

const routeOutput = createRouteOutput(index);

export const ibcTransfer = (): RouteOutput => routeOutput("/");

export const withdraw = (): RouteOutput => routeOutput("/withdraw");

export const shieldAll = (): RouteOutput => routeOutput("/shield-all");

export const IbcRoutes = {
  index,
  ibcTransfer,
  withdraw,
  shieldAll,
};

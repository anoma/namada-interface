import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/transfer`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput("/");

export const namTransfer = (): RouteOutput => routeOutput("/nam");

export const shieldAll = (): RouteOutput => routeOutput(`/shield-all`);

export const example = (): RouteOutput => routeOutput(`/example`);

export const TransferRoutes = {
  index,
  overview,
  namTransfer,
  shieldAll,
  example,
};

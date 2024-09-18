import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/transfer`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput("/");

export const transfer = (): RouteOutput => routeOutput("/transfer");

export const masp = (): RouteOutput => routeOutput("/masp");

export const shieldAll = (): RouteOutput => routeOutput("/shield-all");

export default {
  index,
  overview,
  transfer,
  masp,
  shieldAll,
};

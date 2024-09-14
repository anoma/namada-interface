import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/transfer`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput(`/`);

export const shieldAll = (): RouteOutput => routeOutput(`/shield-all`);

export default {
  index,
  overview,
  shieldAll,
};

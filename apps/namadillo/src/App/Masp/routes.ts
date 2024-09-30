import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/masp`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput("/");

export const MaspRoutes = {
  index,
  overview,
};

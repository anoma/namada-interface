import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/masp`;

const routeOutput = createRouteOutput(index);

export const overview = (): RouteOutput => routeOutput("/");

export const shield = (): RouteOutput => routeOutput("/shield");

export const unshield = (): RouteOutput => routeOutput("/unshield");

export const MaspRoutes = {
  index,
  overview,
  shield,
  unshield,
};

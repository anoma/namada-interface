import { createRouteOutput, RouteOutput } from "utils/routes";

export const index = (): string => `/transfer`;

const routeOutput = createRouteOutput(index);

export const namTransfer = (): RouteOutput => routeOutput("/");

export const TransferRoutes = {
  index,
  namTransfer,
};

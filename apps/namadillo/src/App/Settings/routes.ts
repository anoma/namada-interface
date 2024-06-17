import { RouteOutput, createRouteOutput } from "utils/routes";

export const index = (): string => "/settings";

export const routeOutput = createRouteOutput(index);

export const currencySelection = (): RouteOutput => routeOutput("/currency");

export const advanced = (): RouteOutput => routeOutput("/advanced");

export const signArbitrary = (): RouteOutput => routeOutput("/sign-arbitrary");

export default { index, currencySelection, advanced, signArbitrary };

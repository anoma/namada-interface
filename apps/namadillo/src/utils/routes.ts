export type RouteOutput = {
  url: string;
  toString: () => string;
};

export const createRouteOutput =
  (index: () => string) =>
  (route: string): RouteOutput => ({
    url: `${index()}${route}`,
    toString: () => route,
  });

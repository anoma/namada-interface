type RouteOutput = {
  url: string;
  toString: () => string;
};

export const routeOutput = (route: string): RouteOutput => ({
  url: `${index()}${route}`,
  toString: () => route,
});

export const index = (): string => `/staking`;

export const overview = (): RouteOutput => routeOutput(`/overview`);

export const bond = (): RouteOutput => routeOutput("/bond");

export const validatorDetails = (id: string | number): RouteOutput =>
  routeOutput(`/validator-details/${id}`);

export const validatorDetailsOwner = (
  validatorId: string | number,
  ownerId: string | number
): RouteOutput => routeOutput(`${validatorDetails(validatorId)}/${ownerId}`);

export default {
  index,
  bond,
  overview,
  validatorDetails,
  validatorDetailsOwner,
};

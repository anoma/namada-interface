import { routes } from "App/routes";
import { matchPath, useLocation } from "react-router-dom";

export const useCurrentRoute = (): string => {
  const location = useLocation();
  return (
    Object.values(routes).find((route: string) => {
      return matchPath(route, location.pathname) || "";
    }) || ""
  );
};

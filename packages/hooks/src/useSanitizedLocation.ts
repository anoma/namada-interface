import { sanitize } from "isomorphic-dompurify";
import { Location, useLocation } from "react-router-dom";

export const useSanitizedLocation = (): Location => {
  const location = useLocation();
  return {
    ...location,
    pathname: sanitize(location.pathname),
    search: sanitize(location.search),
    hash: sanitize(location.hash),
  };
};

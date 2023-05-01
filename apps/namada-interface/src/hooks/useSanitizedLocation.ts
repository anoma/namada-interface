import { useLocation, Location } from "react-router-dom";
import { sanitize } from "dompurify";

export const useSanitizedLocation = (): Location => {
  const location = useLocation();
  return {
    ...location,
    pathname: sanitize(location.pathname),
    search: sanitize(location.search),
    hash: sanitize(location.hash)
  };
};

import DOMPurify from "isomorphic-dompurify";
import { Location, useLocation } from "react-router-dom";

export const useSanitizedLocation = (): Location => {
  const location = useLocation();
  return {
    ...location,
    pathname: DOMPurify.sanitize(location.pathname),
    search: DOMPurify.sanitize(location.search),
    hash: DOMPurify.sanitize(location.hash),
  };
};

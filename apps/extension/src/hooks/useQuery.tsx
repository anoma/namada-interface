import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { sanitize } from "dompurify";

interface SanitizedURLSearchParams {
  get(name: string): string | null;
}

const toSanitized = (
  urlSearchParams: URLSearchParams
): SanitizedURLSearchParams => ({
  get: (name: string): string | null => {
    const unsanitized = urlSearchParams.get(name);
    return unsanitized === null ? unsanitized : sanitize(unsanitized);
  },
});

const useQuery = (): SanitizedURLSearchParams => {
  const { search } = useLocation();
  return useMemo(() => toSanitized(new URLSearchParams(search)), [search]);
};

export default useQuery;

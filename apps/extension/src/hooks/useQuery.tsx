import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { sanitize } from "dompurify";

interface SanitizedURLSearchParams {
  get(name: string): string | null;
  getAll(): Record<string, string>;
}

const toSanitized = (
  urlSearchParams: URLSearchParams
): SanitizedURLSearchParams => ({
  get: (name: string): string | null => {
    const unsanitized = urlSearchParams.get(name);
    return unsanitized === null ? unsanitized : sanitize(unsanitized);
  },
  getAll: (): Record<string, string> => {
    const values: Record<string, string> = {};

    urlSearchParams.forEach((val, key) => {
      const unsanitized = val;
      if (unsanitized) {
        values[sanitize(key)] = sanitize(unsanitized);
      }
    });

    return values;
  },
});

const useQuery = (): SanitizedURLSearchParams => {
  const { search } = useLocation();
  return useMemo(() => toSanitized(new URLSearchParams(search)), [search]);
};

export default useQuery;

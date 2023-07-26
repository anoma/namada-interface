import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { sanitize } from "dompurify";

interface SanitizedURLSearchParams {
  get(name: string): string | null;
  getAll(): Record<string, string | null>;
}

const toSanitized = (
  urlSearchParams: URLSearchParams
): SanitizedURLSearchParams => ({
  get: (name: string): string | null => {
    const unsanitized = urlSearchParams.get(name);
    return unsanitized === null ? unsanitized : sanitize(unsanitized);
  },
  getAll: (): Record<string, string | null> => {
    const values: Record<string, string | null> = {};

    urlSearchParams.forEach((val, key) => {
      const unsanitized = val;
      values[key] = unsanitized === null ? unsanitized : sanitize(unsanitized);
    });

    return values;
  },
});

const useQuery = (): SanitizedURLSearchParams => {
  const { search } = useLocation();
  return useMemo(() => toSanitized(new URLSearchParams(search)), [search]);
};

export default useQuery;

import { useParams, Params } from "react-router-dom";
import { sanitize } from "dompurify";

type ParamsT<ParamsOrKey> = Readonly<
  [ParamsOrKey] extends [string] ? Params<ParamsOrKey> : Partial<ParamsOrKey>
>

export function useSanitizedParams<
  ParamsOrKey extends string | Record<string, string | undefined> = string
> (): ParamsT<ParamsOrKey> {
  const params = useParams<ParamsOrKey>();
  return Object.entries(params).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: typeof value === 'string' ? sanitize(value) : value
    }),
    {} as ParamsT<ParamsOrKey>
  );
}

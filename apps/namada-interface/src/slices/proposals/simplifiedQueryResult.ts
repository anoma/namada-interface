import { Atom, atom } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";

export type SimplifiedQueryResult<Value> =
  | {
      state: "loading";
    }
  | {
      state: "hasError";
      error: unknown;
    }
  | {
      state: "hasData";
      data: Value;
    };

export const resolve = <T>(data: T): SimplifiedQueryResult<T> => ({
  state: "hasData",
  data,
});

export const then = <A, B>(
  queryResult: SimplifiedQueryResult<A>,
  f: (a: A) => SimplifiedQueryResult<B>
): SimplifiedQueryResult<B> => {
  if (queryResult.state === "hasData") {
    return f(queryResult.data);
  } else {
    return queryResult;
  }
};

export const fromQueryResult = <T, E>(
  queryResult: AtomWithQueryResult<T, E>
): SimplifiedQueryResult<T> => {
  if (queryResult.isSuccess) {
    return { state: "hasData", data: queryResult.data };
  } else if (queryResult.isError) {
    return { state: "hasError", error: queryResult.error };
  } else {
    return { state: "loading" };
  }
};

export const map = <A, B>(
  f: (a: A) => B,
  queryResult: SimplifiedQueryResult<A>
): SimplifiedQueryResult<B> => {
  return then(queryResult, (data) => resolve(f(data)));
};

export const makeAtom = <T, E>(
  queryResultAtom: Atom<AtomWithQueryResult<T, E>>
): Atom<SimplifiedQueryResult<T>> =>
  atom((get) => fromQueryResult(get(queryResultAtom)));

export function all<T1>(
  values: [SimplifiedQueryResult<T1>]
): SimplifiedQueryResult<[T1]>;
export function all<T1, T2>(
  values: [SimplifiedQueryResult<T1>, SimplifiedQueryResult<T2>]
): SimplifiedQueryResult<[T1, T2]>;
export function all<T1, T2, T3>(
  values: [
    SimplifiedQueryResult<T1>,
    SimplifiedQueryResult<T2>,
    SimplifiedQueryResult<T3>,
  ]
): SimplifiedQueryResult<[T1, T2, T3]>;
export function all<T1, T2, T3, T4>(
  values: [
    SimplifiedQueryResult<T1>,
    SimplifiedQueryResult<T2>,
    SimplifiedQueryResult<T3>,
    SimplifiedQueryResult<T4>,
  ]
): SimplifiedQueryResult<[T1, T2, T3, T4]>;
export function all<T1, T2, T3, T4, T5>(
  values: [
    SimplifiedQueryResult<T1>,
    SimplifiedQueryResult<T2>,
    SimplifiedQueryResult<T3>,
    SimplifiedQueryResult<T4>,
    SimplifiedQueryResult<T5>,
  ]
): SimplifiedQueryResult<[T1, T2, T3, T4, T5]>;
export function all<T1, T2, T3, T4, T5, T6>(
  values: [
    SimplifiedQueryResult<T1>,
    SimplifiedQueryResult<T2>,
    SimplifiedQueryResult<T3>,
    SimplifiedQueryResult<T4>,
    SimplifiedQueryResult<T5>,
    SimplifiedQueryResult<T6>,
  ]
): SimplifiedQueryResult<[T1, T2, T3, T4, T5, T6]>;
export function all<T>(
  values: SimplifiedQueryResult<T>[]
): SimplifiedQueryResult<T[]> {
  return values.reduceRight<SimplifiedQueryResult<T[]>>(
    (acc, curr) =>
      then(acc, (accValue) =>
        then(curr, (currValue) => resolve([currValue, ...accValue]))
      ),
    resolve([])
  );
}

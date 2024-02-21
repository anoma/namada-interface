import * as O from "fp-ts/Option";
import * as t from "io-ts";

//TODO: maybe we can infer A?
export type Entity<A, T extends t.Type<A>> = {
  schema: T;
  migration: (data: unknown) => O.Option<t.TypeOf<T>>;
};

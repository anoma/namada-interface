import { Message } from "./Message";
import { Env } from "./types";

export type Handler = (env: Env, msg: Message<unknown>) => unknown;
export type InternalHandler<M extends Message<unknown>> = (
  env: Env,
  msg: M
) =>
  | (M extends Message<infer R> ? R : never)
  | Promise<M extends Message<infer R> ? R : never>;

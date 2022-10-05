import { Anoma } from "./Anoma";
import { Result } from "router/types";

export type ProxyMethod = keyof Omit<Anoma, "version">;

export enum ProxyRequestTypes {
  Request = "anoma-proxy-request",
  Response = "anoma-proxy-request-response",
}

// TODO: Look into better generic typing for this:
// eslint-disable-next-line
export interface ProxyRequest<T = any> {
  type: ProxyRequestTypes;
  id: string;
  method: ProxyMethod;
  args: T;
}

export interface ProxyRequestResponse {
  type: ProxyRequestTypes.Response;
  id: string;
  result: Result | undefined;
}

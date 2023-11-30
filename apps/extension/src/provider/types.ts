import { Namada } from "./Namada";
import { Result } from "router/types";

export type ProxyMethod = keyof Omit<Namada, "version">;

export enum ProxyRequestTypes {
  Request = "namada-proxy-request",
  Response = "namada-proxy-request-response",
}

// TODO: Look into better generic typing for this:
// eslint-disable-next-line
export interface ProxyRequest<T = any> {
  type: ProxyRequestTypes;
  id: string;
  method: ProxyMethod;
  args?: T;
}

export interface ProxyRequestResponse {
  type: ProxyRequestTypes.Response;
  id: string;
  result: Result | undefined;
}

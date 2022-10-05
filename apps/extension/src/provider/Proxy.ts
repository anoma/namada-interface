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

export class Proxy {
  static startProxy(
    anoma: Anoma,
    eventListener: {
      addMessageListener: (fn: (e: MessageEvent<ProxyRequest>) => void) => void;
      postMessage: (message: ProxyRequestResponse) => void;
    } = {
      addMessageListener: (fn) => window.addEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    }
  ): void {
    eventListener.addMessageListener(async (e) => {
      const message = e.data;

      if (!message || message.type !== ProxyRequestTypes.Request) {
        return;
      }

      const { method, args } = message;

      try {
        if (!anoma[method] || typeof anoma[method] !== "function") {
          throw new Error(`${message.method} not found!`);
        }

        const result = await anoma[method](args);
        const proxyResponse: ProxyRequestResponse = {
          type: ProxyRequestTypes.Response,
          id: message.id,
          result: {
            return: result,
          },
        };

        eventListener.postMessage(proxyResponse);
      } catch (e: unknown) {
        const proxyResponse: ProxyRequestResponse = {
          type: ProxyRequestTypes.Response,
          id: message.id,
          result: {
            error: e,
          },
        };

        eventListener.postMessage(proxyResponse);
      }
    });
  }
}

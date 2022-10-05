import { Anoma } from "./Anoma";
import { ProxyRequest, ProxyRequestResponse, ProxyRequestTypes } from "./types";

export class Proxy {
  static startProxy(anoma: Anoma): void {
    Proxy.addMessageListener(async (e) => {
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

        Proxy.postMessage(proxyResponse);
      } catch (e: unknown) {
        const proxyResponse: ProxyRequestResponse = {
          type: ProxyRequestTypes.Response,
          id: message.id,
          result: {
            error: e,
          },
        };

        Proxy.postMessage(proxyResponse);
      }
    });
  }

  static addMessageListener(fn: (e: MessageEvent<ProxyRequest>) => void): void {
    window.addEventListener("message", fn);
  }

  static postMessage(message: ProxyRequestResponse): void {
    window.postMessage(message, window.location.origin);
  }
}

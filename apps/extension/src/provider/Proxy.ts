import { LocalStorage } from "storage";
import { Namada } from "./Namada";
import { ProxyRequest, ProxyRequestResponse, ProxyRequestTypes } from "./types";

export class Proxy {
  static start(namada: Namada, localStorage: LocalStorage): void {
    Proxy.addMessageListener(async (e) => {
      const message = e.data;

      if (!message || message.type !== ProxyRequestTypes.Request) {
        return;
      }

      const { method, args } = message;

      if (method !== "connect" && method !== "isConnected") {
        const approvedOrigins = (await localStorage.getApprovedOrigins()) || [];
        if (!approvedOrigins.includes(e.origin)) {
          return;
        }
      }

      try {
        if (!namada[method] || typeof namada[method] !== "function") {
          throw new Error(`${message.method} not found!`);
        }

        const result = await namada[method](args);
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

import { KVStore } from "@namada/storage";
import { ApprovedOriginsStore, APPROVED_ORIGINS_KEY } from "background/approvals";

import { Namada } from "./Namada";
import { ProxyRequest, ProxyRequestResponse, ProxyRequestTypes } from "./types";

export class Proxy {
  static start(
    namada: Namada,
    approvedOriginsStore: KVStore<ApprovedOriginsStore>,
  ): void {
    Proxy.addMessageListener(async (e) => {
      const message = e.data;

      if (!message || message.type !== ProxyRequestTypes.Request) {
        return;
      }

      const { method, args } = message;

      if (method !== "connect") {
        const approvedOrigins = await approvedOriginsStore.get(APPROVED_ORIGINS_KEY) || [];
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

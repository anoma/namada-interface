import {
  ProxyMethod,
  ProxyRequest,
  ProxyRequestResponse,
  ProxyRequestTypes,
} from "./types";

export class InjectedProxy {
  static addMessageListener(fn: (e: MessageEvent<ProxyRequest>) => void): void {
    window.addEventListener("message", fn);
  }

  static removeMessageListener(
    fn: (e: MessageEvent<ProxyRequest>) => void
  ): void {
    window.removeEventListener("message", fn);
  }

  static postMessage(message: ProxyRequest): void {
    window.postMessage(message, window.location.origin);
  }

  static requestMethod<T, U>(method: ProxyMethod, args?: T): Promise<U> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: ProxyRequestTypes.Request,
      id,
      method,
      args,
    };

    return new Promise((resolve, reject): void => {
      const receiveResponse = (e: MessageEvent): void => {
        const proxyResponse: ProxyRequestResponse = e.data;

        if (
          !proxyResponse ||
          proxyResponse.type !== ProxyRequestTypes.Response
        ) {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        InjectedProxy.removeMessageListener(receiveResponse);

        const { result } = proxyResponse;

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          reject(new Error(`${result.error}`));
          return;
        }

        resolve(result.return as U);
      };

      InjectedProxy.addMessageListener(receiveResponse);
      InjectedProxy.postMessage(proxyMessage);
    });
  }
}

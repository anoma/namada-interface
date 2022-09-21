import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, Signer } from "@anoma/types";
import { Anoma } from "./Anoma";
import { Result } from "../router/types";

type ProxyMethod = keyof Anoma;

enum ProxyRequestTypes {
  Request = "anoma-proxy-request",
  Response = "anoma-proxy-request-response",
}

export interface ProxyRequest {
  type: ProxyRequestTypes;
  id: string;
  method: ProxyMethod;
  args: any;
}

export interface ProxyRequestResponse {
  type: ProxyRequestTypes.Response;
  id: string;
  result: Result | undefined;
}

export class InjectedAnoma implements IAnoma {
  static startProxy(
    anoma: Anoma,
    eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    parseMessage: (message: any) => ProxyRequest = (message) => message
  ) {
    eventListener.addMessageListener(async (e: any) => {
      const message = parseMessage(e.data);

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

  protected requestMethod(method: ProxyMethod, args: any): Promise<any> {
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

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: MessageEvent) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (
          !proxyResponse ||
          proxyResponse.type !== ProxyRequestTypes.Response
        ) {
          return;
        }

        if (proxyResponse.id !== id) {
          return;
        }

        this.eventListener.removeMessageListener(receiveResponse);

        const { result } = proxyResponse;

        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          reject(new Error(result.error as any));
          return;
        }

        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);
      this.eventListener.postMessage(proxyMessage);
    });
  }

  constructor(
    private readonly _version: string,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: any) => void) => void;
      removeMessageListener: (fn: (e: any) => void) => void;
      postMessage: (message: any) => void;
    } = {
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {}

  public async connect(chainId: string): Promise<void> {
    return await this.requestMethod("connect", chainId);
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return this.requestMethod("chain", chainId);
  }

  public async chains(): Promise<Chain[]> {
    return await this.requestMethod("chains", undefined);
  }

  public async suggestChain(chain: Chain): Promise<void> {
    await this.requestMethod("suggestChain", chain);
  }

  public async getSigner(chainId: string): Promise<Signer> {
    return await this.requestMethod("getSigner", chainId);
  }

  public version() {
    return this._version;
  }
}

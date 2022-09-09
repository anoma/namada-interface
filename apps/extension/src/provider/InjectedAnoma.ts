import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, Signer } from "@anoma/types";
import { Anoma } from "./Anoma";
import { Result } from "../router/types";

type ProxyMethods =
  | "suggestChain"
  | "connect"
  | "getSigner"
  | "chains"
  | "version";

enum ProxyRequestTypes {
  Request = "proxy-request",
  Response = "proxy-request-response",
}

export interface ProxyRequest {
  type: ProxyRequestTypes;
  id: string;
  method: ProxyMethods;
  // TODO: Remove following `any` with a better type
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
      // TODO: Remove following `any` once structure is known
      addMessageListener: (fn: (e: any) => void) => void;
      // TODO: Remove following `any` once structure is known
      postMessage: (message: any) => void;
    } = {
      // TODO: Remove following `any` once structure is known
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    parseMessage?: (message: any) => any
  ) {
    // TODO: Remove following `any` once structure is known
    eventListener.addMessageListener(async (e: any) => {
      const message: ProxyRequest = parseMessage
        ? parseMessage(e.data)
        : e.data;

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

  protected requestMethod(
    method: ProxyMethods,
    args: any // TODO: Remove following `any` once structure is known
  ): Promise<any> {
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

    console.log({ proxyMessage });

    return new Promise((resolve, reject) => {
      const receiveResponse = (e: MessageEvent) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        console.log("receiveResponse", { proxyResponse });
        if (
          !proxyResponse ||
          proxyResponse.type !== ProxyRequestTypes.Response
        ) {
          return;
        }

        console.log(
          "Do IDs match?",
          proxyResponse.id,
          id,
          proxyResponse.id === id
        );
        if (proxyResponse.id !== id) {
          return;
        }
        console.log("requestMethod called", { proxyMessage });
        this.eventListener.removeMessageListener(receiveResponse);

        const { result } = proxyResponse;
        console.log("requestMethod - result =", { result });
        if (!result) {
          reject(new Error("Result is null"));
          return;
        }

        if (result.error) {
          // TODO: Remove following `any` once structure is known
          reject(new Error(result.error as any));
          return;
        }

        console.log({ result });
        resolve(result.return);
      };

      this.eventListener.addMessageListener(receiveResponse);
      this.eventListener.postMessage(proxyMessage);
    });
  }

  constructor(
    private readonly _version: string,
    protected readonly eventListener: {
      // TODO: Remove following `any` once structure is known
      addMessageListener: (fn: (e: any) => void) => void;
      // TODO: Remove following `any` once structure is known
      removeMessageListener: (fn: (e: any) => void) => void;
      // TODO: Remove following `any` once structure is known
      postMessage: (message: any) => void;
    } = {
      // TODO: Remove following `any` once structure is known
      addMessageListener: (fn: (e: any) => void) =>
        window.addEventListener("message", fn),
      // TODO: Remove following `any` once structure is known
      removeMessageListener: (fn: (e: any) => void) =>
        window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    },
    protected readonly parseMessage?: (message: any) => any
  ) {}

  public async connect(chainId: string): Promise<void> {
    this.requestMethod("connect", chainId);
  }

  public async suggestChain(chain: Chain): Promise<string> {
    const { chainId } = chain;
    await this.requestMethod("suggestChain", chain);
    return chainId;
  }

  public getSigner(chainId: string): Signer {
    this.requestMethod("getSigner", chainId);
    return {} as Signer;
  }

  public version() {
    return this._version;
  }

  public chains(): Chain[] {
    this.requestMethod("chains", undefined);
    return [];
  }
}

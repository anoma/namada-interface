import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";
import { Anoma } from "../api";
import { Result } from "../types";

type ProxyMethods = "addChain" | "enable" | "getSigner";

export interface ProxyRequest {
  type: "proxy-request";
  id: string;
  method: ProxyMethods;
  args: ChainConfig & string;
}

export interface ProxyRequestResponse {
  type: "proxy-request-response";
  id: string;
  result: Result | undefined;
}

export class InjectedAnoma implements IAnoma {
  private _chains: ChainConfig[] = [];

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
      if (!message || message.type !== "proxy-request") {
        return;
      }

      const { method, args } = message;
      try {
        if (!anoma[method] || typeof anoma[method] !== "function") {
          throw new Error(`Invalid method: ${message.method}`);
        }

        const result = await anoma[method](args);

        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
          id: message.id,
          result: {
            return: result,
          },
        };

        eventListener.postMessage(proxyResponse);
      } catch (e: unknown) {
        const proxyResponse: ProxyRequestResponse = {
          type: "proxy-request-response",
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
    args: ChainConfig & string
    // TODO: Remove following `any` once structure is known
  ): Promise<any> {
    const bytes = new Uint8Array(8);
    const id: string = Array.from(crypto.getRandomValues(bytes))
      .map((value) => {
        return value.toString(16);
      })
      .join("");

    const proxyMessage: ProxyRequest = {
      type: "proxy-request",
      id,
      method,
      args,
    };

    return new Promise((resolve, reject) => {
      // TODO: Remove following `any` once structure is known
      const receiveResponse = (e: any) => {
        const proxyResponse: ProxyRequestResponse = this.parseMessage
          ? this.parseMessage(e.data)
          : e.data;

        if (!proxyResponse || proxyResponse.type !== "proxy-request-response") {
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
          // TODO: Remove following `any` once structure is known
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

  public async enable(chainId: string): Promise<void> {
    console.log("InjectedAnoma::enable()", { chainId });
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    console.log("InjectedAnoma::addChain()", { config });
    return true;
  }

  public getSigner(): Signer {
    console.log("InjectedAnoma::getSigner()");
    return {} as Signer;
  }

  public get version() {
    return this._version;
  }

  public get chains(): ChainConfig[] {
    return this._chains;
  }
}

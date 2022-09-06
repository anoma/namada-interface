import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";
import { Anoma } from "./Anoma";
import { Result } from "../router/types";

type ProxyMethods = "addChain" | "connect" | "getSigner";
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
        console.log("METHOD CALLED -> ", anoma[method], message);
        if (!anoma[method] || typeof anoma[method] !== "function") {
          throw new Error(`Invalid method: ${message.method}`);
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

    return new Promise((resolve, reject) => {
      // TODO: Remove following `any` once structure is known
      const receiveResponse = (e: any) => {
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

  public async connect(chainId: string): Promise<void> {
    console.log("InjectedAnoma::connect()", { chainId });
    this.requestMethod("connect", chainId);
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    console.log("InjectedAnoma::addChain()", { config });
    this.requestMethod("addChain", config);
    return true;
  }

  public getSigner(chainId: string): Signer {
    console.log("InjectedAnoma::getSigner()");
    this.requestMethod("getSigner", chainId);
    return {} as Signer;
  }

  public get version() {
    return this._version;
  }

  public get chains(): ChainConfig[] {
    // TODO
    return [];
  }
}

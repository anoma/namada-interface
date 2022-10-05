import { Anoma as IAnoma, Chain, Signer } from "@anoma/types";
import {
  ProxyMethod,
  ProxyRequest,
  ProxyRequestResponse,
  ProxyRequestTypes,
} from "./Proxy";

export class InjectedAnoma implements IAnoma {
  protected requestMethod<T, U>(method: ProxyMethod, args: T): Promise<U> {
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

        this.eventListener.removeMessageListener(receiveResponse);

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

      this.eventListener.addMessageListener(receiveResponse);
      this.eventListener.postMessage(proxyMessage);
    });
  }

  constructor(
    private readonly _version: string,
    protected readonly eventListener: {
      addMessageListener: (fn: (e: MessageEvent<ProxyRequest>) => void) => void;
      removeMessageListener: (
        fn: (e: MessageEvent<ProxyRequest>) => void
      ) => void;
      postMessage: (message: ProxyRequest) => void;
    } = {
      addMessageListener: (fn) => window.addEventListener("message", fn),
      removeMessageListener: (fn) => window.removeEventListener("message", fn),
      postMessage: (message) =>
        window.postMessage(message, window.location.origin),
    }
  ) {}

  public async connect(chainId: string): Promise<void> {
    return await this.requestMethod<string, void>("connect", chainId);
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return this.requestMethod<string, Chain>("chain", chainId);
  }

  public async chains(): Promise<Chain[]> {
    return await this.requestMethod<void, Chain[]>("chains", undefined);
  }

  public async suggestChain(chain: Chain): Promise<void> {
    await this.requestMethod<Chain, void>("suggestChain", chain);
  }

  public async getSigner(chainId: string): Promise<Signer> {
    return await this.requestMethod<string, Signer>("getSigner", chainId);
  }

  public version(): string {
    return this._version;
  }
}

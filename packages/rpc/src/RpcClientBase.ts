import { Network, Protocol } from "./types";

export type RpcClientInitArgs = Network;

abstract class RpcClientBase {
  private _url: string;
  private _port?: number;
  private _protocol: Protocol;

  constructor({ url, port, protocol = "http" }: RpcClientInitArgs) {
    this._url = url;
    this._port = port;
    this._protocol = protocol;
  }

  public set url(url: string) {
    this._url = url;
  }

  public set port(port: number) {
    this._port = port;
  }

  public set protocol(protocol: Protocol) {
    this._protocol = protocol;
  }

  protected get endpoint(): string {
    return `${this._protocol}://${this._url}${
      this._port ? `:${this._port}` : ""
    }`;
  }
}

export default RpcClientBase;

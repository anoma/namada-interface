import { NetworkConfig, Protocol } from "config";

export type RpcClientInitArgs = NetworkConfig;

abstract class RpcClientBase {
  private _url: string;
  private _port: number;
  private _protocol: Protocol;

  constructor({ url, port = 26657, protocol = "http" }: RpcClientInitArgs) {
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
    return `${this._protocol}://${this._url}:${this._port}`;
  }
}

export default RpcClientBase;

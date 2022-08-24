import { Network, Protocol } from "../types";

export class RpcConfig {
  constructor(
    private _url: string,
    private _port: number | undefined,
    private _protocol: Protocol,
    private _wsProtocol: Protocol
  ) {}

  public get network(): Network {
    return {
      url: this._url,
      port: this._port,
      protocol: this._protocol,
    };
  }

  public get wsNetwork(): Network {
    return {
      url: this._url,
      port: this._port,
      protocol: this._wsProtocol,
    };
  }
}

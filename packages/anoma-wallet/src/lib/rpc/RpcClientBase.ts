import { NetworkConfig, Protocol } from "config";

export type RpcClientInitArgs = NetworkConfig;

abstract class RpcClientBase {
  private _network: string;
  private _port: number;
  private _protocol: Protocol;

  constructor({ network, port = 26657, protocol = "http" }: RpcClientInitArgs) {
    this._network = network;
    this._port = port;
    this._protocol = protocol;
  }

  public set network(network: string) {
    this._network = network;
  }

  public set port(port: number) {
    this._port = port;
  }

  public set protocol(protocol: Protocol) {
    this._protocol = protocol;
  }

  protected get endpoint(): string {
    return `${this._protocol}://${this._network}:${this._port}`;
  }
}

export default RpcClientBase;

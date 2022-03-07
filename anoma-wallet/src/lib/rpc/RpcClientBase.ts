type Protocol = "http" | "https" | "ws" | "wss";

export type RpcClientInitArgs = {
  network: string;
  port: number;
  protocol?: Protocol;
};

abstract class RpcClientBase {
  private _network: string;
  private _port: number;
  private _protocol: string;

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

  public set protocol(protocol: string) {
    this._protocol = protocol;
  }

  protected get endpoint(): string {
    return `${this._protocol}://${this._network}:${this._port}`;
  }
}

export default RpcClientBase;

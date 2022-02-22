type Protocol = "http" | "https";
type WSProtocol = "ws" | "wss";

export type RpcClientInitArgs = {
  network: string;
  port: number;
  protocol: Protocol;
  wsProtocol: WSProtocol;
};

abstract class RpcClientBase {
  private _network: string;
  private _port: number;
  private _protocol: string;
  private _wsProtocol: string;

  constructor({ network, port, protocol, wsProtocol }: RpcClientInitArgs) {
    this._network = network;
    this._port = port;
    this._protocol = protocol;
    this._wsProtocol = wsProtocol;
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

  public set wsProtocol(wsProtocol: string) {
    this._wsProtocol = wsProtocol;
  }

  protected get httpEndpoint() {
    return `${this._protocol}://${this._network}:${this._port}`;
  }

  protected get wsEndpoint() {
    return `${this._wsProtocol}://${this._network}:${this._port}`;
  }
}

export default RpcClientBase;

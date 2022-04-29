import ChainConfig, { Protocol } from "./chain";

export type NetworkConfig = {
  url: string;
  port: number;
  protocol: Protocol;
};

const config = ChainConfig["Namada"];
const { url, port, protocol, wsProtocol } = config;

/**
 * TODO: This can likely be removed. We will eventually want to switch chains,
 * and all RPC calls should be made according to that chain's configuration
 */
export default class RPCConfig {
  private _url = url;
  private _port = port;
  private _protocol: Protocol = protocol;
  private _wsProtocol: Protocol = wsProtocol;

  public get network(): NetworkConfig {
    return {
      url: this._url,
      port: this._port,
      protocol: this._protocol,
    };
  }

  public get wsNetwork(): NetworkConfig {
    return {
      url: this._url,
      port: this._port,
      protocol: this._wsProtocol,
    };
  }
}

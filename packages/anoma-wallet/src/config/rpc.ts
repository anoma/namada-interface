import ChainConfig, { Protocol } from "./chain";

export type NetworkConfig = {
  url: string;
  port: number;
  protocol: Protocol;
};

const config = Object.values(ChainConfig)[0]; // Load settings from default chain
const { url, port, protocol, wsProtocol } = config.network;

/**
 * TODO: This config can likely be removed. We will eventually want to allow the
 * use to select a chains, and all RPC calls should be made according to that chain's
 * configuration. Instantiating an RpcClient or SocketClient should pass the network
 * config belonging to the active chain instead of being hard-coded here.
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

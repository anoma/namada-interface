const { REACT_APP_LOCAL } = process.env;

export type Protocol = "http" | "https" | "ws" | "wss";

export type NetworkConfig = {
  url: string;
  port: number;
  protocol: Protocol;
};

// DEVNET defaults

const DEVNET_URL = "localhost";
const DEVNET_PORT = 26657;
const DEVNET_PROTOCOL = "http";
const DEVNET_WS_PROTOCOL = "ws";

// const DEVNET_URL = "testnet-ux.anoma-euw1.heliax.dev";
// const DEVNET_PORT = 443;
// const DEVNET_PROTOCOL = "https";
// const DEVNET_WS_PROTOCOL = "wss";

// Localhost defaults
const LOCALHOST_URL = "localhost";
const LOCALHOST_PORT = 26657;
const LOCALHOST_PROTOCOL = "http";
const LOCALHOST_WS_PROTOCOL = "ws";

export default class Config {
  private _isLocal = !!REACT_APP_LOCAL;
  private _url = this._isLocal ? LOCALHOST_URL : DEVNET_URL;
  private _port = this._isLocal ? LOCALHOST_PORT : DEVNET_PORT;
  private _protocol: Protocol = this._isLocal
    ? LOCALHOST_PROTOCOL
    : DEVNET_PROTOCOL;
  private _wsProtocol: Protocol = this._isLocal
    ? LOCALHOST_WS_PROTOCOL
    : DEVNET_WS_PROTOCOL;

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

import RPCConfig from "./rpc";
import IBCConfig from "./ibc";

export { type Protocol, type NetworkConfig } from "./rpc";

const Config = {
  rpc: new RPCConfig(),
  ibc: IBCConfig,
};

export default Config;

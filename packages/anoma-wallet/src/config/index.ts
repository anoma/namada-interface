import RPCConfig from "./rpc";
import ChainConfig from "./chain";
import IBCConfig from "./ibc";

export { type NetworkConfig } from "./rpc";
export { type Protocol } from "./chain";

const Config = {
  rpc: new RPCConfig(),
  chain: ChainConfig,
  ibc: IBCConfig,
};

export default Config;

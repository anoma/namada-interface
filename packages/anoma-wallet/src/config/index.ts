import RPCConfig from "./rpc";
import ChainConfig from "./chain";

export { type NetworkConfig } from "./rpc";
export { type Protocol } from "./chain";

const Config = {
  rpc: new RPCConfig(),
  chain: ChainConfig,
};

export default Config;

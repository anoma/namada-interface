import ChainConfig from "./chain";
import ApiConfig from "./api";

export { default as RPCConfig, type Network } from "./rpc";
export { defaultChainId, type Protocol, type Chain } from "./chain";

const Config = {
  chain: ChainConfig,
  api: ApiConfig,
};

export default Config;

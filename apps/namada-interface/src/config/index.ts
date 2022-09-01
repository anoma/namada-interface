import ApiConfig from "./api";
import ChainConfig from "./chain";
import IBCConfig from "./ibc";

export { defaultChainId, type Protocol, type Chain } from "./chain";

const Config = {
  api: ApiConfig,
  chain: ChainConfig,
  ibc: IBCConfig,
};

export default Config;

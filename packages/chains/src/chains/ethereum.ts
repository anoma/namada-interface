// import { BridgeType, Chain, Extensions } from "@namada/types";
// import { ProxyMappings } from "../types";
//
// const DEFAULT_ALIAS = "Goerli Testnet";
// const DEFAULT_CHAIN_ID = "0x5";
// const DEFAULT_RPC = "https://eth-goerli.g.alchemy.com/v2/";
//
// const {
//   REACT_APP_PROXY: isProxied,
//   REACT_APP_ETH_ALIAS: alias = DEFAULT_ALIAS,
//   REACT_APP_ETH_CHAIN_ID: chainId = DEFAULT_CHAIN_ID,
//   REACT_APP_ETH_URL: rpc = DEFAULT_RPC,
// } = process.env;
//
// const ethereum: Chain = {
//   alias,
//   bech32Prefix: "eth",
//   bip44: {
//     coinType: 1,
//   },
//   bridgeType: [BridgeType.Ethereum],
//   rpc: isProxied ? ProxyMappings["ethereum"] : rpc,
//   chainId,
//   currency: {
//     token: "Ethereum",
//     symbol: "ETH",
//     gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
//   },
//   extension: Extensions["metamask"],
// };
//
// export default ethereum;
